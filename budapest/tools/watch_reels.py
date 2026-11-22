#!/usr/bin/env python3
"""Watch Budapest Instagram reels for the AI.

Asks the trip server for reels that still need analysis, downloads each mp4,
extracts 8 evenly spaced JPEG frames with ffmpeg and posts them back so the
server can run the Claude analysis. Stdlib only.

Local test of extraction only:
    python3 watch_reels.py --test-file path/to/video.mp4
"""
import base64
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

API = "https://gtlxkkkbnowcudhwisqe.supabase.co/functions/v1/trip"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")
MAX_REELS = 40
MAX_SECONDS = 15 * 60
MAX_BYTES = 40 * 1024 * 1024
N_FRAMES = 8
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def read_anon_key():
    try:
        with open(os.path.join(REPO, "budapest", "trip.js"), encoding="utf-8") as f:
            src = f.read()
        m = re.search(r"reelglobe\s*:\s*\{.*?anonKey\s*:\s*['\"]([^'\"]+)['\"]", src, re.S)
        return m.group(1) if m else ""
    except OSError:
        return ""


ANON = read_anon_key()


def post(payload, timeout=60):
    headers = {"Content-Type": "application/json"}
    if ANON:
        headers["apikey"] = ANON
        headers["Authorization"] = "Bearer " + ANON
    req = urllib.request.Request(API, data=json.dumps(payload).encode(),
                                 headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read()
    except urllib.error.HTTPError as e:
        body = e.read()
    try:
        return json.loads(body.decode("utf-8", "replace") or "{}")
    except ValueError:
        return {"error": "bad json: " + body[:200].decode("utf-8", "replace")}


class DownloadError(Exception):
    pass


def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
            total = 0
            while True:
                chunk = r.read(65536)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_BYTES:
                    raise DownloadError("too large")
                f.write(chunk)
    except urllib.error.HTTPError as e:
        raise DownloadError("HTTP %d" % e.code)
    except (urllib.error.URLError, OSError, ValueError) as e:
        raise DownloadError(str(e))
    if total == 0:
        raise DownloadError("empty")


def duration(path):
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", path],
            capture_output=True, text=True, timeout=30).stdout.strip()
        d = float(out)
        return d if d > 0 else None
    except (ValueError, subprocess.SubprocessError, OSError):
        return None


def extract_frames(path, n=N_FRAMES):
    """Return up to n base64 JPEG strings (no data: prefix)."""
    d = duration(path)
    times = [(i + 0.5) / n * d for i in range(n)] if d else [1 + 2 * i for i in range(n)]
    frames = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, t in enumerate(times):
            out = os.path.join(tmp, "f%d.jpg" % i)
            try:
                subprocess.run(
                    ["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", "%.3f" % t,
                     "-i", path, "-frames:v", "1", "-vf", "scale=512:-2",
                     "-q:v", "5", out],
                    capture_output=True, timeout=60)
                if os.path.exists(out) and os.path.getsize(out) > 0:
                    with open(out, "rb") as f:
                        frames.append(base64.b64encode(f.read()).decode("ascii"))
            except (subprocess.SubprocessError, OSError):
                continue
    return frames


def summarize(res):
    if not isinstance(res, dict):
        return "?"
    if res.get("error"):
        return "error: %s" % str(res["error"])[:150]
    ai = (res.get("reel") or {}).get("ai") or {}
    places = ai.get("places") or []
    return "relevant=%s places=%d" % (ai.get("relevant"), len(places) if isinstance(places, list) else 0)


def handle(item, stats):
    rid, url = item.get("id"), item.get("video")
    if not rid:
        return
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "v.mp4")
        try:
            if not url:
                raise DownloadError("no video url")
            download(url, path)
        except DownloadError as e:
            print("%s  download failed (%s) -> broken" % (rid, e), flush=True)
            post({"id": rid, "broken": True})
            stats["broken"] += 1
            return
        frames = extract_frames(path)
    if not frames:
        print("%s  no frames -> broken" % rid, flush=True)
        post({"id": rid, "broken": True})
        stats["broken"] += 1
        return
    res = post({"id": rid, "frames": frames}, timeout=150)
    print("%s  %d frames  %s" % (rid, len(frames), summarize(res)), flush=True)
    stats["error" if isinstance(res, dict) and res.get("error") else "ok"] += 1


def main():
    if len(sys.argv) >= 3 and sys.argv[1] == "--test-file":
        frames = extract_frames(sys.argv[2])
        sizes = [len(base64.b64decode(f)) for f in frames]
        ok = all(base64.b64decode(f)[:2] == b"\xff\xd8" for f in frames)
        print("frames=%d jpeg=%s sizes_kb=%s" % (len(frames), ok, [s // 1024 for s in sizes]))
        return 0 if len(frames) == N_FRAMES and ok else 1

    start = time.time()
    stats = {"ok": 0, "error": 0, "broken": 0}
    seen = set()
    done = 0
    while done < MAX_REELS and time.time() - start < MAX_SECONDS:
        try:
            res = post({"todo": True, "limit": 10})
        except Exception as e:  # network failure on todo: stop the run
            print("todo request failed: %s" % e, flush=True)
            break
        todo = [t for t in (res.get("todo") or []) if t.get("id") not in seen]
        if not todo:
            if res.get("error"):
                print("todo error: %s" % res["error"], flush=True)
            break
        for item in todo:
            if done >= MAX_REELS or time.time() - start >= MAX_SECONDS:
                break
            seen.add(item.get("id"))
            done += 1
            try:
                handle(item, stats)
            except Exception as e:
                print("%s  failed: %s" % (item.get("id"), e), flush=True)
                stats["error"] += 1
    print("summary: processed=%d ok=%d errors=%d broken=%d in %ds" % (
        done, stats["ok"], stats["error"], stats["broken"], time.time() - start))
    return 0


if __name__ == "__main__":
    try:
        main_rc = main()
    except Exception as e:
        print("fatal: %s" % e)
        main_rc = 0
    sys.exit(main_rc if len(sys.argv) >= 3 and sys.argv[1] == "--test-file" else 0)
