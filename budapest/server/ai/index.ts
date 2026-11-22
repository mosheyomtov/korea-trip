// The trip app's AI (Budapest). Called by the app, no secret:
//   {plan: true, favs, extra, days, hotel, facts}   an AI schedule from the places they liked, with weather and suggestions (not saved)
//   {chat: [{role, content}], ctx, stream?, draft?, focus?}   "דונה", the trip assistant: answers and acts with tools
// Shared state lives in trip_state (plan, favs, adds), the same rows the `trip` function and the app use.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import Anthropic from "npm:@anthropic-ai/sdk@0.68.0";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const secret = async (name: string) => (await db.rpc("get_secret", { secret_name: name })).data as string | null;
const MODEL = "claude-opus-5-5";
const CITY = "Budapest, Hungary", CENTER = { lat: 47.4979, lng: 19.0402 }, BOX = { min_lat: 47.35, max_lat: 47.65, min_lng: 18.90, max_lng: 19.35 };
const PLACES_URL = "https://mosheyomtov.github.io/korea-trip/budapest/places.js";
let client: Anthropic | null = null;
const ai = async () => client ??= new Anthropic({ apiKey: (await secret("anthropic_api_key")) ?? "" });

async function getState(t: string) {
  const { data } = await db.from("trip_state").select("key,value").eq("trip", t);
  return Object.fromEntries((data ?? []).map((x: any) => [x.key, x.value]));
}
async function setState(t: string, key: string, value: unknown) {
  const { error } = await db.from("trip_state").upsert({ trip: t, key, value, at: new Date().toISOString() }, { onConflict: "trip,key" });
  if (error) throw new Error(error.message);
}
async function placesList() {
  const src = await (await fetch(`${PLACES_URL}?v=${Date.now()}`, { signal: AbortSignal.timeout(15_000) })).text();
  const w: any = {}; new Function("window", src)(w);
  return (w.PLACES ?? []).flatMap((c: any) => c.items.map((it: any) => ({ ...it, cat: c.id, catTitle: c.title })));
}
// the text of the model's answer; throws a clear error when it was cut off or declined
function textOf(res: any) {
  if (res.stop_reason === "max_tokens") throw new Error("התשובה נקטעה באמצע (ארוכה מדי)");
  if (res.stop_reason === "refusal") throw new Error("ה-AI סירב לבקשה");
  return res.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
}

// ── Smart schedule ──
const PLAN_MODELS = ["claude-haiku-5-5", "claude-sonnet-5-5"];   // Moshe's choice: Haiku, Sonnet when Haiku fails
const ITEM = { type: "object", additionalProperties: false, required: ["t", "icon", "name", "place", "desc", "why_he"],
  properties: { t: { type: "string" }, icon: { type: "string" }, name: { type: "string" }, place: { type: "string" }, desc: { type: "string" }, why_he: { type: "string" } } };
const PLAN_SCHEMA = {
  type: "object", additionalProperties: false, required: ["overview_he", "days", "left_out_he", "suggestions"],
  properties: {
    overview_he: { type: "string" }, left_out_he: { type: "string" },
    days: { type: "array", items: { type: "object", additionalProperties: false, required: ["date", "title", "why_he", "weather_he", "items"],
      properties: { date: { type: "string" }, title: { type: "string" }, why_he: { type: "string" }, weather_he: { type: "string" }, items: { type: "array", items: ITEM } } } },
    suggestions: { type: "array", items: { type: "object", additionalProperties: false, required: ["kind", "place", "name_he", "date", "t", "icon", "reason_he"],
      properties: { kind: { type: "string", enum: ["add", "remove"] }, place: { type: "string" }, name_he: { type: "string" }, date: { type: "string" }, t: { type: "string" }, icon: { type: "string" }, reason_he: { type: "string" } } } },
  },
};
const RULES = `- They keep Shabbat: from Friday candle lighting (Budapest, late November: about 15:45) until Saturday night (about 17:00): no transport, no shopping, no paid entry; only walking distance from the hotel, synagogues, parks, outside views. Friday: be back at the hotel before candle lighting. Saturday night after Shabbat is fine for markets.
- Food: kosher meat restaurants only for meat; dairy/vegetarian places are fine.
- Group places that are close to each other on the same day; keep a realistic pace (walking, transport, opening hours, short winter daylight ~7:15-16:00). Christmas markets and light shows in the evening.`;
const WMO: Record<number, string> = { 0: "clear", 1: "mostly clear", 2: "partly cloudy", 3: "overcast", 45: "fog", 48: "fog", 51: "drizzle", 53: "drizzle", 55: "drizzle", 61: "light rain", 63: "rain", 65: "heavy rain", 66: "freezing rain", 67: "freezing rain", 71: "light snow", 73: "snow", 75: "heavy snow", 77: "snow grains", 80: "rain showers", 81: "rain showers", 82: "heavy showers", 85: "snow showers", 86: "snow showers", 95: "thunderstorm" };
async function weather(from: string, to: string) {
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${CENTER.lat}&longitude=${CENTER.lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code,wind_speed_10m_max&timezone=Europe%2FBudapest&start_date=${from}&end_date=${to}`;
    const d = (await (await fetch(u, { signal: AbortSignal.timeout(8000) })).json()).daily;
    if (!d?.time) return {};
    return Object.fromEntries(d.time.map((t: string, i: number) => [t, { tmin: Math.round(d.temperature_2m_min[i]), tmax: Math.round(d.temperature_2m_max[i]), rain: d.precipitation_probability_max[i] ?? 0, mm: d.precipitation_sum[i] ?? 0, wind: Math.round(d.wind_speed_10m_max[i] ?? 0), code: d.weather_code[i], sky: WMO[d.weather_code[i]] ?? "" }]));
  } catch { return {}; }
}
async function plan(b: any) {
  const all = await placesList();
  const favs = new Set((b.favs ?? []).map(String));
  const id = (p: any) => p.en || p.name;
  const liked = all.filter((p: any) => favs.has(id(p))).map((p: any) => ({ place: id(p), he: p.name, cat: p.catTitle, desc: String(p.desc ?? "").slice(0, 200), type: p.type }));
  const extra = (b.extra ?? []).slice(0, 30).map((x: any) => ({ place: String(x.place ?? ""), he: String(x.name ?? ""), desc: String(x.desc ?? "").slice(0, 200) }));
  if (!liked.length && !extra.length) return { error: "no_favs" };
  const others = all.filter((p: any) => !favs.has(id(p))).map((p: any) => ({ place: id(p), he: p.name, cat: p.catTitle, rec: !!p.rec, desc: String(p.desc ?? "").slice(0, 110) }));
  const dates = (b.days ?? []).map((d: any) => d.date).filter(Boolean).sort();
  const wx = dates.length ? await weather(dates[0], dates[dates.length - 1]) : {};
  const sys = `You plan a city trip for an Israeli couple (Moshe and Pas). Write everything in natural, concise Hebrew.
Facts: ${b.facts ?? ""}
Rules:
- The schedule uses ONLY the places they liked ("liked" and "extra" below; "place" is the id you must copy into each item's place field). Do NOT put any other attraction, restaurant, market, synagogue or sight into the days, even a famous one. Fixed items (flights, hotel) are given: keep them as they are, with an empty place. Besides liked places and fixed items, only plain rest items are allowed (e.g. back to the hotel, Shabbat meal at the hotel), with an empty place.
${RULES}
- Weather (forecast per day below, °C, rain = chance %): put outdoor places (markets, walks, viewpoints, river) on the drier, milder days or hours and indoor ones (baths, halls, museums, cafes, malls) on rainy, snowy, windy or very cold days. Say it in why_he when weather drove the choice. weather_he: one short line per day (e.g. "‎2-6 מעלות, גשם אחה״צ, כדאי מטרייה"); empty if there is no forecast.
- If there are too many places, leave some out and say which in left_out_he.
- suggestions (0-6, only when really worth it; the user decides): kind "add" = a place from "others" that would clearly improve a day (fills an empty slot, fits the weather, is right next to where they are, a must for first-timers); give the best date and time for it. kind "remove" = a liked place you put in the plan that is a weak fit (too far, closed then, too packed a day, bad in that weather); date and t = where it is now. reason_he: one honest sentence. place = the id exactly.
- overview_he: 3-5 sentences on the logic of the whole plan. why_he per day: one sentence. Each item: t "HH:MM", one emoji icon, name in Hebrew, desc: one short practical tip, why_he: one sentence on why it is at this time/day.`;
  const input = JSON.stringify({ days: (b.days ?? []).map((d: any) => ({ ...d, forecast: wx[d.date] ?? null })), hotel: b.hotel, liked, extra, others });
  let res: any = null, lastErr: unknown = null;
  for (const model of PLAN_MODELS) {
    try {
      res = await (await ai()).messages.stream({
        model, max_tokens: 64000, system: sys,
        output_config: { effort: "medium", format: { type: "json_schema", schema: PLAN_SCHEMA } },
        messages: [{ role: "user", content: input }],
      } as any).finalMessage();
      console.log("plan", model, res.stop_reason, JSON.stringify(res.usage));
      JSON.parse(textOf(res) || "{}");
      break;
    } catch (e) { console.error("plan", model, (e as Error).message); lastErr = e; res = null; }
  }
  if (!res) throw lastErr ?? new Error("plan failed");
  const out = JSON.parse(textOf(res) || "{}");
  const byId = new Map(all.map((p: any) => [id(p), p]));
  for (const x of b.extra ?? []) byId.set(String(x.place), x);
  const ok = new Set([...liked.map((p: any) => p.place), ...extra.map((x: any) => x.place)]);
  const inPlan = new Set<string>();
  const hhmm = (s: string) => { const m = String(s ?? "").match(/(\d{1,2})[:.](\d{2})/); return m ? `${m[1].padStart(2, "0")}:${m[2]}` : ""; };
  const geo = (it: any) => { const p: any = byId.get(it.place); if (p?.lat) { it.lat = p.lat; it.lng = p.lng; } return it; };
  for (const d of out.days ?? []) {
    // only places they hearted: drop anything else that names a place
    d.items = (d.items ?? []).filter((it: any) => !String(it.place ?? "").trim() || ok.has(it.place))
      .map((it: any) => { it.t = hhmm(it.t); if (it.place) inPlan.add(it.place); return geo(it); })
      .sort((x: any, y: any) => x.t.localeCompare(y.t));
    if (wx[d.date]) d.weather = wx[d.date];
  }
  const dayOk = new Set((out.days ?? []).map((d: any) => d.date));
  out.suggestions = (out.suggestions ?? []).filter((s: any) => dayOk.has(s.date) && (s.kind === "add" ? byId.has(s.place) && !ok.has(s.place) : inPlan.has(s.place)))
    .slice(0, 6).map((s: any) => { s.t = hhmm(s.t); const p: any = byId.get(s.place); if (s.kind === "add") s.desc = String(p?.desc ?? "").slice(0, 200); return geo(s); });
  return { plan: { ...out, made: new Date().toISOString(), favs: [...favs] } };
}

// ── דונה: the chat assistant ──
const TOOLS: any[] = [
  { name: "search_videos", description: "Search the trip's Instagram reels library (reels whose whole video was watched and analysed by AI) by place or topic. Returns AI summaries of what each video shows. Use it whenever the user asks about videos, or to learn what a place is like.",
    input_schema: { type: "object", additionalProperties: false, required: ["query"], properties: { query: { type: "string", description: "place name (English or Hebrew) or topic, e.g. 'christmas market', 'langos', 'Szimpla'" }, place_key: { type: "string", description: "optional: the key of one of their places" } } } },
  { name: "watch_video", description: "Get the full AI analysis of one video from the library by id (what is seen, tips, places in it). Analyses it now if it was never analysed.",
    input_schema: { type: "object", additionalProperties: false, required: ["id"], properties: { id: { type: "string" } } } },
  { name: "find_place", description: "Find the exact location of a place in Budapest by name. Returns coordinates and a Google Maps link, and shows the user a place card.",
    input_schema: { type: "object", additionalProperties: false, required: ["name"], properties: { name: { type: "string", description: "the place's real (local/English) name" }, name_he: { type: "string" }, desc_he: { type: "string", description: "one short Hebrew sentence about it" } } } },
  { name: "show_places", description: "Show the user cards of some of THEIR places (from the list in the context) with navigation buttons.",
    input_schema: { type: "object", additionalProperties: false, required: ["keys"], properties: { keys: { type: "array", items: { type: "string" } } } } },
  { name: "get_weather", description: "Weather forecast for Budapest for given dates (daily min/max, rain, sunrise/sunset).",
    input_schema: { type: "object", additionalProperties: false, required: ["from", "to"], properties: { from: { type: "string", description: "YYYY-MM-DD" }, to: { type: "string", description: "YYYY-MM-DD" } } } },
  { name: "update_day", description: "Replace the whole schedule of ONE day (saved for both travelers right away). Send the full final list of items for that day, including fixed items (flights, check-in) that should stay. Use only places marked ♥; other places are left out. Ask before big rewrites the user did not request.",
    input_schema: { type: "object", additionalProperties: false, required: ["date", "title", "why_he", "items"], properties: {
      date: { type: "string", description: "YYYY-MM-DD" }, title: { type: "string", description: "short Hebrew title for the day" }, why_he: { type: "string", description: "one Hebrew sentence on why the day is built this way" },
      items: { type: "array", items: { type: "object", additionalProperties: false, required: ["t", "icon", "name", "desc"], properties: {
        t: { type: "string", description: "HH:MM" }, icon: { type: "string", description: "one emoji" }, name: { type: "string", description: "Hebrew" }, desc: { type: "string", description: "short practical tip" },
        place: { type: "string", description: "key of one of their places, if it is one" }, lat: { type: "number" }, lng: { type: "number" } } } } } } },
  { name: "set_favorite", description: "Add or remove a heart (♥) on one of their places. Hearts are shared by both travelers and feed the smart schedule.",
    input_schema: { type: "object", additionalProperties: false, required: ["key", "on"], properties: { key: { type: "string" }, on: { type: "boolean" } } } },
  { name: "add_place", description: "Add a new place to their places list (e.g. one found in a video or by find_place). Use find_place first to get coordinates.",
    input_schema: { type: "object", additionalProperties: false, required: ["name_he", "name_local", "what_he", "category"], properties: {
      name_he: { type: "string" }, name_local: { type: "string" }, what_he: { type: "string" }, where_he: { type: "string" },
      category: { type: "string", enum: ["food", "cafe", "sight", "nature", "night", "fun", "shop", "other"] }, lat: { type: "number" }, lng: { type: "number" }, favorite: { type: "boolean" } } } },
];

const unent = (s: string) => String(s ?? "").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const thumb = (r: any) => r.source === "youtube" ? `https://i.ytimg.com/vi/${r.code}/hqdefault.jpg` : r.thumb;
const videoCard = (r: any) => ({ type: "video", id: r.id, title: r.ai?.title_he || r.title || "", thumb: thumb(r) ?? null, url: r.url, source: r.source, place: r.ai?.places?.[0]?.name_he ?? null });
const plain = (s: string) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
let reelsCache: { at: number; rows: any[] } | null = null;
async function reels() {
  if (reelsCache && Date.now() - reelsCache.at < 120_000) return reelsCache.rows;
  const { data } = await db.rpc("trip_reels", { ...BOX, lim: 800 });
  reelsCache = { at: Date.now(), rows: (data ?? []) as any[] };
  return reelsCache.rows;
}
async function geocode(q: string) {
  const key = await secret("geo_key");
  try {
    if (key) {
      const res = await fetch(`https://reelglobe.mosheyt2.workers.dev/geo?q=${encodeURIComponent(q)}&lat=${CENTER.lat}&lng=${CENTER.lng}`, { headers: { "x-geo-key": key }, signal: AbortSignal.timeout(8000) });
      if (res.ok) { const j = await res.json(); if (!j.error && j.lat) return j; }
    }
    const p = new URL("https://photon.komoot.io/api/");
    p.search = new URLSearchParams({ q, limit: "1", lang: "en", lat: String(CENTER.lat), lon: String(CENTER.lng) }).toString();
    const f = (await (await fetch(p, { headers: { "User-Agent": "TripApp/1.0" }, signal: AbortSignal.timeout(8000) })).json()).features?.[0];
    return f ? { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], label: [f.properties?.name, f.properties?.street, f.properties?.district].filter(Boolean).join(", ") } : { error: "not found" };
  } catch { return { error: "lookup failed" }; }
}
const mapsUrl = (lat?: number, lng?: number, q?: string) => lat ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q ?? "")}`;

type Run = { t: string; ctx: any; cards: any[]; changed: Set<string>; draft?: any };
async function runTool(name: string, x: any, run: Run): Promise<unknown> {
  const { t, ctx } = run;
  const places: any[] = ctx.places ?? [];
  switch (name) {
    case "search_videos": {
      const rows = await reels();
      const words = plain(x.query).split(/[^a-z0-9֐-׿]+/).filter((w) => w.length > 2);
      const linked = new Set(places.find((p) => p.key === x.place_key)?.reels ?? []);
      const scored = rows.filter((r) => r.source === "instagram" && r.ai?.relevant && r.ai?.watched).map((r) => {
        const hay = plain([r.title, r.place, r.ai?.title_he, r.ai?.summary_he, ...(r.ai?.places ?? []).flatMap((p: any) => [p.name_he, p.name_local, p.match, p.what_he])].join(" "));
        let s = words.filter((w) => hay.includes(w)).length / Math.max(words.length, 1);
        if (linked.has(r.id) || (x.place_key && (r.ai?.places ?? []).some((p: any) => p.match === x.place_key))) s += 2;
        if (r.trip === t) s += 0.2;
        return { r, s };
      }).filter((o) => o.s >= (words.length > 2 ? 0.66 : 0.99)).sort((a, b) => b.s - a.s).slice(0, 6);
      if (!scored.length) return { found: 0, note: "no Instagram reel about this in the library yet. Tell them they can share reels from Instagram into the app." };
      run.cards.push(...scored.map((o) => videoCard(o.r)));
      return { found: scored.length, videos: scored.map(({ r }) => ({ id: r.id, source: r.source, title: r.ai?.title_he || r.title, summary: r.ai?.summary_he ?? "(not analysed yet)", places: (r.ai?.places ?? []).map((p: any) => p.name_local || p.name_he) })) };
    }
    case "watch_video": {
      let { data: r } = await db.from("reels").select("*").eq("id", x.id).maybeSingle();
      if (!r) return { error: "no such video" };
      if (!r.ai) {
        const o = await (await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/trip`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trip: t, id: r.id }), signal: AbortSignal.timeout(90_000) })).json().catch(() => ({}));
        if (o.reel) r = o.reel;
      }
      run.cards.push(videoCard(r));
      return { id: r.id, source: r.source, url: r.url, creator: r.creator, title: r.ai?.title_he || r.title, relevant: r.ai?.relevant, summary: r.ai?.summary_he, places: r.ai?.places ?? [], watched_frames: r.ai?.frames ?? 0 };
    }
    case "find_place": {
      const g: any = await geocode(`${x.name}, ${CITY}`);
      const ok = !g.error && g.lat > BOX.min_lat && g.lat < BOX.max_lat && g.lng > BOX.min_lng && g.lng < BOX.max_lng;
      const card = { type: "place", name: x.name_he || x.name, en: x.name, desc: x.desc_he ?? "", lat: ok ? g.lat : null, lng: ok ? g.lng : null, maps: ok ? mapsUrl(g.lat, g.lng) : mapsUrl(undefined, undefined, `${x.name}, Budapest`) };
      run.cards.push(card);
      return ok ? { lat: g.lat, lng: g.lng, address: g.label ?? "", maps: card.maps } : { error: "exact location not found; the card links to a Google Maps search", maps: card.maps };
    }
    case "show_places": {
      const hits = (x.keys ?? []).map((k: string) => places.find((p) => p.key === k)).filter(Boolean).slice(0, 8);
      run.cards.push(...hits.map((p: any) => ({ type: "place", key: p.key, name: p.name, en: p.en, desc: p.desc ?? "", lat: p.lat, lng: p.lng, maps: mapsUrl(p.lat, p.lng, `${p.en || p.name}, Budapest`) })));
      return { shown: hits.length };
    }
    case "get_weather": {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${CENTER.lat}&longitude=${CENTER.lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code,sunrise,sunset&timezone=Europe%2FBudapest&start_date=${x.from}&end_date=${x.to}`;
      const r = await (await fetch(u, { signal: AbortSignal.timeout(10_000) })).json();
      return r.daily ?? { error: r.reason ?? "no forecast for those dates (forecasts reach ~16 days ahead)" };
    }
    case "update_day": {
      const st = run.draft ? { plan: run.draft } : await getState(t);
      const base = st.plan?.days ? st.plan : { overview_he: "", left_out_he: "", days: (ctx.days ?? []).map((d: any) => ({ date: d.date, title: d.title, why_he: "", items: d.items ?? [] })) };
      if (!base.days.some((d: any) => d.date === x.date)) {
        const d0 = (ctx.days ?? []).find((d: any) => d.date === x.date);
        if (!d0) return { error: "that date is not a trip day" };
        base.days.push({ date: x.date, title: d0.title, why_he: "", items: [] });
        base.days.sort((a: any, b: any) => a.date.localeCompare(b.date));
      }
      // only places they hearted (fixed items and rest items have no place)
      const notLiked = (x.items ?? []).filter((it: any) => it?.place && places.some((q) => q.key === it.place && !q.fav)).map((it: any) => it.name);
      const items = (x.items ?? []).filter((it: any) => it && String(it.name ?? "").trim() && !notLiked.includes(it.name)).slice(0, 20).map((it: any) => {
        const m = String(it.t ?? "").match(/(\d{1,2})[:.](\d{2})/); it.t = m ? `${m[1].padStart(2, "0")}:${m[2]}` : "";
        const p = places.find((q) => q.key === it.place);
        return { t: it.t, icon: it.icon, name: it.name, desc: it.desc, ...(it.why_he ? { why_he: it.why_he } : {}), place: p ? p.key : "", ...(it.lat ? { lat: it.lat, lng: it.lng } : p?.lat ? { lat: p.lat, lng: p.lng } : {}) };
      }).sort((a: any, b: any) => String(a.t).localeCompare(String(b.t)));
      const day = { date: x.date, title: x.title, why_he: x.why_he, items };
      const old = base.days.find((d: any) => d.date === x.date);
      if (old?.weather) (day as any).weather = old.weather;
      if (old?.weather_he) (day as any).weather_he = old.weather_he;
      base.days = base.days.map((d: any) => d.date === x.date ? day : d);
      if (run.draft) { run.draft = base; run.changed.add("draft"); }   // a proposal they have not approved yet: change it, don't save
      else { await setState(t, "plan", { ...base, approved: new Date().toISOString(), edited_by_ai: true }); run.changed.add("plan"); }
      run.cards.push({ type: "day", date: x.date, title: x.title, items: items.map((i: any) => ({ t: i.t, icon: i.icon, name: i.name })) });
      return { ok: true, saved_items: items.length, ...(notLiked.length ? { dropped_not_liked: notLiked, note: "these are not hearted, so they were left out; tell the user and offer to heart them" } : {}) };
    }
    case "set_favorite": {
      const st = await getState(t);
      const favs = new Set<string>(Array.isArray(st.favs) ? st.favs : (ctx.favs ?? []));
      x.on ? favs.add(x.key) : favs.delete(x.key);
      const lp = (ctx.places ?? []).find((q: any) => q.key === x.key); if (lp) lp.fav = !!x.on;
      await setState(t, "favs", [...favs].slice(0, 300));
      run.changed.add("favs");
      return { ok: true, hearts: favs.size };
    }
    case "add_place": {
      const st = await getState(t);
      const adds = Array.isArray(st.adds) ? st.adds : [];
      const key = "chat:" + plain(x.name_local).replace(/[^a-z0-9]+/g, " ").trim();
      if (!adds.some((a: any) => a.key === key)) adds.push({ key, name_he: x.name_he, name_local: x.name_local, what_he: x.what_he, where_he: x.where_he ?? "", lat: x.lat ?? null, lng: x.lng ?? null, category: x.category });
      await setState(t, "adds", adds.slice(-200));
      run.changed.add("adds");
      if (x.favorite) { await runTool("set_favorite", { key, on: true }, run); }
      run.cards.push({ type: "place", key, name: x.name_he, en: x.name_local, desc: x.what_he, lat: x.lat, lng: x.lng, maps: mapsUrl(x.lat, x.lng, `${x.name_local}, Budapest`) });
      return { ok: true, key };
    }
  }
  return { error: "unknown tool" };
}

function chatSystem(ctx: any, st: any, focus?: string) {
  const places = (ctx.places ?? []).map((p: any) => `${p.key} | ${p.name}${p.en && p.en !== p.name ? " / " + p.en : ""} | ${p.cat}${p.where ? " | " + p.where : ""}${p.fav ? " | ♥" : ""}${p.reels?.length ? ` | ${p.reels.length} videos` : ""}`).join("\n");
  const sched = (st.plan?.days ?? ctx.days ?? []).map((d: any) => `${d.date} ${d.title}${d.weather_he ? ` (${d.weather_he})` : ""}:\n${(d.items ?? []).map((i: any) => `  ${i.t} ${i.icon ?? ""} ${i.name}${i.place ? ` [${i.place}]` : ""}`).join("\n") || "  (empty)"}`).join("\n");
  return `את "דונה" (Duna, the Danube in Hungarian), העוזרת האישית של משה ופס לטיול שלהם לבודפשט. You are female: speak about yourself in feminine Hebrew forms (בדקתי, סידרתי, אני שמחה). ALWAYS answer in Hebrew (never English), warm, natural and SHORT (a few sentences or a short list; use **bold** sparingly; no headings, no tables). Friendly, a bit playful, never overdo emojis (0-2 per reply).
You can act, not only talk: use the tools to check videos, find locations, check the weather and change the schedule. When the user asks you to change something, do it with the tools and then say briefly what you changed. If the request is unclear or would wipe a lot of their plan, ask one short question first. The schedule is built ONLY from places marked ♥ (plus fixed items and plain rest items such as back to the hotel): never add an attraction, restaurant or sight they did not heart, even a famous one. If they want an unliked place in the schedule, heart it first with set_favorite (only when they asked for that place), otherwise suggest it in words. To build several days, call update_day once per day (all in the same turn), keep each item's desc to one short sentence, and keep fixed items (flights, check-in, check-out) exactly as they are. Never invent videos, prices or opening hours; say when you are not sure. The app shows the cards your tools produce (videos, places, the changed day) under your message, so don't paste links or long lists of the same things in the text.
Trip facts: ${CITY}. Travelers: Moshe and Pas (Israeli). Hotel: ${ctx.hotel?.name ?? ""}, ${ctx.hotel?.addr ?? ""}. Flights: ${(ctx.flights ?? []).map((f: any) => `${f.dir} ${f.date} ${f.from}->${f.to} ${f.code} dep ${f.dep} arr ${f.arr}`).join("; ")}. Today is ${ctx.today ?? ""}.
${RULES}

${st.draft ? "They are looking at a DRAFT schedule proposal (not approved yet). update_day changes this draft only; they approve it in the app.\n" : ""}${focus ? `They opened you from the schedule of ${focus}: questions like "this day" mean that date.\n` : ""}Current schedule${st.draft ? " (draft)" : st.plan?.approved ? " (approved, shared by both)" : ""}:
${sched}

Their places ("key | name | category | area | ♥ if liked | videos"). Use the key when a tool asks for a place key:
${places}`;
}

const STATUS: Record<string, (x: any) => string> = {
  search_videos: () => "מחפשת ריילים…", watch_video: () => "צופה בסרטון…", find_place: () => "מחפשת את המקום במפה…",
  show_places: () => "אוספת את המקומות…", get_weather: () => "בודקת את מזג האוויר…", update_day: () => "בונה את הלו״ז…",
  set_favorite: () => "מעדכנת את האהובים…", add_place: () => "מוסיפה את המקום…",
};
const WD = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
async function chat(t: string, b: any, emit: (e: any) => void = () => {}) {
  const started = Date.now();
  const ctx = b.ctx ?? {};
  const st: any = await getState(t);
  if (b.draft?.days) { st.plan = b.draft; st.draft = true; }
  if (Array.isArray(st.favs)) { const f = new Set(st.favs); for (const p of ctx.places ?? []) p.fav = f.has(p.key); }
  const run: Run = { t, ctx, cards: [], changed: new Set(), ...(b.draft?.days ? { draft: b.draft } : {}) };
  const msgs: any[] = (b.chat ?? []).slice(-20).filter((m: any) => (m.role === "user" || m.role === "assistant") && String(m.content ?? "").trim())
    .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return { error: "no_message" };
  const system = [{ type: "text", text: chatSystem(ctx, st, typeof b.focus === "string" ? b.focus : undefined), cache_control: { type: "ephemeral" } }];
  const c = await ai();
  let reply = "";
  for (let step = 0; step < 8; step++) {
    const stream: any = c.messages.stream({ model: MODEL, max_tokens: 16000, system, tools: TOOLS, output_config: { effort: "low" }, messages: msgs } as any);
    stream.on("streamEvent", (ev: any) => { if (ev.type === "content_block_start" && ev.content_block?.type === "tool_use") emit({ type: "status", text: STATUS[ev.content_block.name]?.({}) ?? "עובדת על זה…" }); });
    const res: any = await stream.finalMessage();
    console.log("chat", step, res.stop_reason, JSON.stringify(res.usage));
    if (res.stop_reason === "refusal") return { reply: "סליחה, את זה אני לא יכול לעשות 🙈", cards: run.cards, changed: [...run.changed] };
    const text = res.content.filter((x: any) => x.type === "text").map((x: any) => x.text).join("\n").trim();
    if (text) reply = text;
    msgs.push({ role: "assistant", content: res.content });
    const uses = res.content.filter((x: any) => x.type === "tool_use");
    if (res.stop_reason !== "tool_use" || !uses.length) break;
    // one after another: several schedule changes in one turn must not overwrite each other
    const results: any[] = [];
    for (const u of uses) {
      if (u.name === "update_day" && /^\d{4}-\d\d-\d\d$/.test(u.input?.date ?? "")) emit({ type: "status", text: `שומרת את יום ${WD[new Date(u.input.date + "T12:00").getDay()]}…` });
      try { results.push({ type: "tool_result", tool_use_id: u.id, content: JSON.stringify(await runTool(u.name, u.input ?? {}, run)).slice(0, 12000) }); }
      catch (e) { results.push({ type: "tool_result", tool_use_id: u.id, is_error: true, content: (e as Error).message }); }
    }
    msgs.push({ role: "user", content: results });
    if (Date.now() - started > 110_000) { if (!reply) reply = run.changed.size ? "עדכנתי את מה שהספקתי. רוצים שאמשיך?" : "זה לוקח לי יותר מדי זמן, ננסה בקשה קצרה יותר?"; break; }
    emit({ type: "status", text: "מסכמת…" });
  }
  const seen = new Set<string>();
  const cards = run.cards.filter((k) => { const id = `${k.type}:${k.id ?? k.key ?? k.date ?? k.name}`; if (seen.has(id)) return false; seen.add(id); return true; }).slice(0, 12);
  return { reply: reply || "סיימתי 👍", cards, changed: [...run.changed], ...(run.changed.has("draft") ? { draft: run.draft } : {}) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const body = await req.json().catch(() => ({}));
    const trip = body.trip === "budapest" ? "budapest" : "budapest";
    if (body.plan) return json(await plan(body));
    if (Array.isArray(body.chat) && body.stream) {          // progress as it works, then the answer (server-sent events)
      const enc = new TextEncoder();
      const rs = new ReadableStream({
        async start(ctl) {
          const send = (e: any) => { try { ctl.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`)); } catch { /* closed */ } };
          const ping = setInterval(() => send({ type: "ping" }), 8000);
          try { send({ type: "done", ...(await chat(trip, body, send)) }); }
          catch (e) { console.error(e); send({ type: "done", error: (e as Error).message }); }
          finally { clearInterval(ping); try { ctl.close(); } catch { /* closed */ } }
        },
      });
      return new Response(rs, { headers: { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
    }
    if (Array.isArray(body.chat)) return json(await chat(trip, body));
    return json({ error: "bad_request" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
