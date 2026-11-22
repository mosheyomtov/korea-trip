/* ═══ דונה: the trip's AI assistant. Renders into #s-chat and the floating circle #navAi, talks to /functions/v1/ai ═══
   Uses index.html globals (looked up lazily): T, RG, H, STATE, favs, PL, REELS, todayStr, store, esc, say,
   loadServer, openReel, placeByKey, fmt, go, renderDay, renderPills, curDay. */
(() => {
  const root = document.getElementById('s-chat'); if (!root) return;
  const get = (n, d) => { try { const v = eval(n); return v === undefined ? d : v } catch { return d } };
  const E = typeof esc === 'function' ? esc : s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const S = typeof store === 'object' && store ? store : { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} } };
  const toast = t => typeof say === 'function' && say(t);
  const goTo = s => (typeof go === 'function' ? go : typeof show === 'function' ? show : () => {})(s);

  // Duna's mark: a soft gradient sparkle star
  let uid = 0;
  const DUNA = (cls = '') => { const i = ++uid; return `<svg class="duna ${cls}" viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="dnB${i}" x1=".15" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="#7DB6FF"/><stop offset=".5" stop-color="#5B6BFF"/><stop offset="1" stop-color="#B05CF6"/></linearGradient>
      <linearGradient id="dnS${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3D9"/><stop offset="1" stop-color="#C084FC"/></linearGradient></defs>
    <path d="M29 7C30.6 22.5 35.5 27.4 51 29C35.5 30.6 30.6 35.5 29 51C27.4 35.5 22.5 30.6 7 29C22.5 27.4 27.4 22.5 29 7Z" fill="url(#dnB${i})" stroke="url(#dnB${i})" stroke-width="3" stroke-linejoin="round"/>
    <path d="M29 15C29.9 24 32 26.6 40 28C33 28.6 30.2 31 29 38" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".35"/>
    <path class="tw" d="M50 40C50.7 45.3 52.7 47.3 58 48C52.7 48.7 50.7 50.7 50 56C49.3 50.7 47.3 48.7 42 48C47.3 47.3 49.3 45.3 50 40Z" fill="url(#dnS${i})"/></svg>` };

  const SUGS = [
    ['calendar_today', 't-blue', 'מה יש לנו מחר?'],
    ['auto_awesome', 't-violet', 'תסדרי לנו את יום שישי'],
    ['movie', 't-pink', 'תראי לי ריילים של שוק חג המולד'],
    ['restaurant', 't-green', 'איפה אוכלים כשר ליד המלון?'],
    ['partly_cloudy_day', 't-sky', 'מה מזג האוויר בטיול?'],
    ['favorite', 't-amber', 'תוסיפי את Szimpla Kert לאהובים'],
  ];
  const THINK = ['דונה חושבת…', 'בודקת בלו״ז…', 'מסתכלת על המקומות שלכם…', 'מחפשת ריילים…', 'בודקת מרחקים במפה…', 'עוד רגע…'];

  /* ── conversations, saved on this phone ── */
  const KEY = 'duna-chats';
  let chats = S.get(KEY, null);
  if (!Array.isArray(chats)) {                       // bring over the conversation from the first version
    const old = S.get('budi-chat', []);
    chats = Array.isArray(old) && old.length ? [{ id: 'c' + Date.now(), at: Date.now(), msgs: old.filter(m => m && typeof m.content === 'string') }] : [];
  }
  let cur = null, busy = false, err = null, thinkT = null, q = '';
  const save = () => { chats = chats.filter(c => c.msgs.length).sort((a, b) => b.at - a.at).slice(0, 30); S.set(KEY, chats) };
  const msgs = () => cur ? cur.msgs : [];
  const titleOf = c => (c.msgs.find(m => m.role === 'user')?.content || 'שיחה').slice(0, 60);

  root.innerHTML = `
    <div class="dn-top">
      <button class="dn-ib" id="dnMenu" aria-label="שיחות קודמות"><span class="ms">menu</span></button>
      <div class="dn-title">${DUNA()}דונה <small>· העוזרת של הטיול</small></div>
      <button class="dn-ib" id="dnClose" aria-label="סגירה"><span class="ms">close</span></button>
    </div>
    <div class="dn-wrap"><div id="dnLog"></div></div>
    <form class="dn-comp" id="dnForm" autocomplete="off">
      <div class="dn-field"><textarea id="dnIn" rows="1" placeholder="שאלו את דונה כל דבר…" enterkeyhint="send"></textarea>
        <button class="dn-send" id="dnSend" type="submit" aria-label="שליחה" hidden><span class="ms">send</span></button></div>
      <button class="dn-mic" id="dnMic" type="button" aria-label="הקלטה"><span class="ms">mic</span></button>
    </form>
    <div class="dn-dim" id="dnDim"></div>
    <aside class="dn-drawer" aria-label="שיחות">
      <div class="hd">${DUNA()}<b>דונה</b><button class="dn-ib" id="dnShut" aria-label="סגירה"><span class="ms">close</span></button></div>
      <label class="dn-search"><span class="ms">search</span><input id="dnQ" placeholder="חיפוש בשיחות"></label>
      <div class="dn-hist" id="dnHist"></div>
      <button class="dn-newbtn" id="dnNew"><span class="ms">edit_square</span>שיחה חדשה</button>
    </aside>`;
  const $$ = s => root.querySelector(s);
  const log = $$('#dnLog'), inp = $$('#dnIn'), send = $$('#dnSend'), mic = $$('#dnMic');

  // the floating circle in the bottom bar
  const fab = document.getElementById('navAi');
  if (fab) { fab.innerHTML = DUNA(); fab.onclick = () => goTo('chat') }

  /* ── light, safe markdown ── */
  function md(src) {
    const inline = s => E(s)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, t, u) => `<a href="${u.replace(/"/g, '&quot;')}" target="_blank" rel="noopener">${t}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    const out = []; let list = null, para = [];
    const fp = () => { if (para.length) { out.push(`<p>${para.join('<br>')}</p>`); para = [] } };
    const fl = () => { if (list) { out.push(`<${list.t}>${list.items.map(x => `<li>${x}</li>`).join('')}</${list.t}>`); list = null } };
    for (const raw of String(src || '').split('\n')) {
      const line = raw.trim(), ul = line.match(/^[-•*]\s+(.*)$/), ol = line.match(/^\d+[.)]\s+(.*)$/);
      if (ul || ol) { fp(); const t = ul ? 'ul' : 'ol'; if (!list || list.t !== t) { fl(); list = { t, items: [] } } list.items.push(inline((ul || ol)[1])) }
      else if (!line) { fl(); fp() } else { fl(); para.push(inline(line)) }
    }
    fl(); fp(); return out.join('');
  }

  /* ── cards: reels, places, a changed day ── */
  const vids = vs => `<div class="dn-vids">${vs.map(v => `<button class="dn-vid" data-vid="${E(v.id)}" data-url="${E(v.url || '')}" style="${v.thumb ? `background-image:url('${E(v.thumb)}'),linear-gradient(160deg,#6FA8FF,#8B5CF6)` : ''}">
      <span class="pl"><span class="ms">play_arrow</span></span>${v.title || v.place ? `<span class="t">${E(v.title || v.place)}</span>` : ''}</button>`).join('')}</div>`;
  function place(c) {
    const onmap = c.key && typeof placeByKey === 'function' && placeByKey(c.key);
    const maps = c.maps || (c.lat ? `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((c.en || c.name || '') + ' Budapest')}`);
    return `<div class="dn-card dn-place"><span class="ic t-blue"><span class="ms">location_on</span></span><div style="min-width:0;flex:1">
      <h4>${E(c.name)}</h4>${c.en && c.en !== c.name ? `<div class="en">${E(c.en)}</div>` : ''}${c.desc ? `<p>${E(c.desc)}</p>` : ''}
      <div class="dn-acts"><a class="dn-act" target="_blank" rel="noopener" href="${E(maps)}"><span class="ms">near_me</span>ניווט</a>
      ${onmap ? `<button class="dn-act g" data-onmap="${E(c.key)}"><span class="ms">map</span>במפה</button>` : ''}</div></div></div>`;
  }
  function day(c) {
    const ok = /^\d{4}-\d\d-\d\d$/.test(c.date || '');
    const WDF = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const when = ok ? `יום ${WDF[new Date(c.date + 'T12:00').getDay()]}${typeof fmt === 'function' ? ', ' + fmt(c.date) : ''}` : '';
    return `<div class="dn-card dn-day"><div class="hd"><span class="ic t-violet"><span class="ms">event_available</span></span>
      <div><b>${E(c.title || 'הלו״ז')}</b><small>${E(when)}</small></div><span class="tag">עודכן</span></div>
      <div class="dn-tl">${(c.items || []).map(it => `<div><span class="tm">${E(it.t || '')}</span><span>${it.icon ? E(it.icon) + ' ' : ''}${E(it.name)}</span></div>`).join('')}</div>
      <button class="dn-act g" data-day="${E(c.date || '')}"><span class="ms">calendar_month</span>לראות בלו״ז</button></div>`;
  }
  function cards(list) {
    if (!Array.isArray(list)) return '';
    const out = []; let vs = [];
    const flush = () => { if (vs.length) { out.push(vids(vs)); vs = [] } };
    for (const c of list) { if (!c) continue; if (c.type === 'video') { vs.push(c); continue } flush(); if (c.type === 'place') out.push(place(c)); if (c.type === 'day') out.push(day(c)) }
    flush(); return out.join('');
  }

  /* ── render ── */
  const hello = () => { const h = new Date().getHours(); return h < 5 ? 'לילה טוב' : h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : h < 21 ? 'ערב טוב' : 'לילה טוב' };
  const names = () => (get('T', {}).travelers || ['משה', 'פס']).join(' ו');
  function render() {
    if (!msgs().length && !busy && !err) {
      log.innerHTML = `<div class="dn-hero"><div class="who">${DUNA('float')}<div class="shadow"></div>
          <div class="hi">${hello()}, ${E(names())}</div><h2>לאן <em>נטייל</em> היום?</h2></div>
        <div class="dn-sugs">${SUGS.map(([ic, t, s], i) => `<button class="dn-sug" data-sug="${E(s)}" style="animation-delay:${.1 + i * .05}s"><span class="ic ${t}"><span class="ms">${ic}</span></span><span class="tx">${E(s)}</span><span class="ms go">chevron_left</span></button>`).join('')}</div></div>`;
      return;
    }
    log.innerHTML = `<div class="dn-log">${msgs().map(m => m.role === 'user'
        ? `<div class="dn-row u"><div class="dn-msg">${E(m.content)}</div></div>`
        : `<div class="dn-row a">${DUNA()}<div class="dn-col">${m.content ? `<div class="dn-msg">${md(m.content)}</div>` : ''}${cards(m.cards)}</div></div>`).join('')}
      ${err ? `<div class="dn-row a">${DUNA()}<div class="dn-col"><div class="dn-err">אופס, לא הצלחתי לענות הפעם${err === true ? '' : ` (${E(err)})`}. בודקים שיש אינטרנט ומנסים שוב?<br><button class="dn-retry" data-retry><span class="ms">refresh</span>לנסות שוב</button></div></div></div>` : ''}
      ${busy ? `<div class="dn-row a busy">${DUNA()}<div class="dn-col"><div class="dn-think" id="dnThink">${THINK[0]}</div></div></div>` : ''}</div>`;
  }
  function renderHist() {
    const list = chats.filter(c => c.msgs.length && (!q || c.msgs.some(m => m.content.includes(q))));
    $$('#dnHist').innerHTML = list.length ? `<div class="lbl">השיחות שלכם</div>` + list.map(c => `<button data-chat="${E(c.id)}" class="${c === cur ? 'on' : ''}">${E(titleOf(c))}</button>`).join('')
      : `<div class="none">${q ? 'לא נמצאו שיחות' : 'עוד אין שיחות. כל שיחה עם דונה תישמר כאן.'}</div>`;
  }
  const open = () => root.classList.contains('on');
  const toBottom = (smooth = true) => open() && requestAnimationFrame(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }));
  function thinking() {
    clearInterval(thinkT); let k = 0;
    thinkT = setInterval(() => { const el = document.getElementById('dnThink'); if (!el) return clearInterval(thinkT); el.textContent = THINK[k = (k + 1) % THINK.length] }, 1900);
  }

  /* ── what Duna knows ── */
  function ctx() {
    const F = get('favs', new Set()), P = get('PL', []), st = get('STATE', {}), T_ = get('T', {});
    return {
      today: get('todayStr', new Date().toISOString().slice(0, 10)), days: (T_.days || []).map(d => ({ date: d.date, title: d.title, items: d.items })),
      plan: st.plan || null, favs: [...F], hotel: (T_.hotels || [])[0], flights: T_.flights,
      places: P.flatMap(c => c.items || []).map(it => ({ key: it.key, name: it.name, en: it.en, cat: it.cat, where: it.where, lat: it.lat, lng: it.lng, fav: F.has(it.key), reels: (it.reels || []).map(x => x.r && x.r.id).filter(Boolean).slice(0, 4) })),
    };
  }
  async function ask() {
    busy = true; err = null; render(); toBottom(); thinking(); grow();
    try {
      const rg = get('RG', null) || get('T', {}).reelglobe || {};
      if (!rg.api) throw new Error('השרת לא מחובר');
      const headers = get('H', null) || { apikey: rg.anonKey, Authorization: 'Bearer ' + rg.anonKey, 'Content-Type': 'application/json' };
      const chat = msgs().filter(m => m.content).slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(rg.api + '/functions/v1/ai', { method: 'POST', headers, body: JSON.stringify({ trip: 'budapest', chat, ctx: ctx() }) });
      let o; try { o = await res.json() } catch { throw new Error('תשובה לא תקינה') }
      if ((!res.ok || o.error) && !o.reply) throw new Error(o.error || 'שגיאה ' + res.status);
      cur.msgs.push({ role: 'assistant', content: String(o.reply || ''), cards: Array.isArray(o.cards) ? o.cards : [] }); cur.at = Date.now(); save();
      busy = false; render(); toBottom();
      if (Array.isArray(o.changed) && o.changed.length) changed(o.changed);
    } catch (e) {
      busy = false; err = e?.message && !/fetch|network/i.test(e.message) ? e.message : true; render(); toBottom();
    } finally { clearInterval(thinkT); grow() }
  }
  async function changed(list) {
    try { if (typeof loadServer === 'function') await loadServer() } catch {}
    try { if (typeof renderPills === 'function') renderPills(); if (typeof renderDay === 'function') renderDay() } catch {}
    const what = { plan: 'את הלו״ז', favs: 'את האהובים', adds: 'את המקומות' };
    const w = list.map(c => what[c]).filter(Boolean);
    toast(`דונה עדכנה ${w.length ? w.join(' ו') : 'את הטיול'}`);
  }
  function submit(text) {
    text = String(text || '').trim(); if (!text || busy) return;
    if (!cur) { cur = { id: 'c' + Date.now(), at: Date.now(), msgs: [] }; chats.unshift(cur) }
    err = null; cur.msgs.push({ role: 'user', content: text }); cur.at = Date.now(); save();
    inp.value = ''; ask();
  }
  function newChat() { if (busy) return; cur = null; err = null; render(); closeDrawer(); scrollTo({ top: 0 }); inp.focus({ preventScroll: true }) }

  /* ── drawer ── */
  const openDrawer = () => { q = ''; $$('#dnQ').value = ''; renderHist(); root.classList.add('dn-open') };
  const closeDrawer = () => root.classList.remove('dn-open');

  /* ── voice: speak instead of typing (where the browser supports it) ── */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  mic.onclick = () => {
    if (!SR) return toast('הדפדפן הזה לא תומך בהקלטה. אפשר להשתמש במיקרופון של המקלדת');
    if (rec) { rec.stop(); return }
    rec = new SR(); rec.lang = 'he-IL'; rec.interimResults = true; rec.continuous = false;
    const before = inp.value ? inp.value.trim() + ' ' : '';
    rec.onresult = e => { inp.value = before + [...e.results].map(r => r[0].transcript).join(''); grow() };
    rec.onend = () => { mic.classList.remove('rec'); rec = null; if (inp.value.trim()) submit(inp.value) };
    rec.onerror = () => { mic.classList.remove('rec'); rec = null };
    mic.classList.add('rec'); rec.start();
  };

  /* ── wiring ── */
  function grow() { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 132) + 'px'; send.hidden = busy || !inp.value.trim() }
  inp.addEventListener('input', grow);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(inp.value) } });
  $$('#dnForm').addEventListener('submit', e => { e.preventDefault(); submit(inp.value) });
  $$('#dnMenu').onclick = openDrawer; $$('#dnShut').onclick = closeDrawer; $$('#dnDim').onclick = closeDrawer; $$('#dnNew').onclick = newChat;
  $$('#dnClose').onclick = () => { closeDrawer(); if (history.state && history.state.d > 0) history.back(); else goTo('plan') };
  $$('#dnQ').addEventListener('input', e => { q = e.target.value.trim(); renderHist() });
  root.addEventListener('click', e => {
    const s = e.target.closest('[data-sug]'); if (s) return submit(s.dataset.sug);
    if (e.target.closest('[data-retry]')) { err = null; return ask() }
    const c = e.target.closest('[data-chat]');
    if (c) { if (busy) return; cur = chats.find(x => x.id === c.dataset.chat) || null; err = null; render(); closeDrawer(); toBottom(false); return }
    const v = e.target.closest('[data-vid]');
    if (v) { const r = get('REELS', []).find(x => String(x.id) === v.dataset.vid); if (r && typeof openReel === 'function') openReel(r); else if (v.dataset.url) window.open(v.dataset.url, '_blank', 'noopener'); return }
    const d = e.target.closest('[data-day]');
    if (d) {
      const i = (get('T', {}).days || []).findIndex(x => x.date === d.dataset.day);
      if (i >= 0) try { curDay = i } catch {}
      goTo('plan'); try { renderPills(); renderDay() } catch {}
    }
    // [data-onmap] is handled by index.html's document click handler
  });
  new MutationObserver(() => { if (open()) { if (msgs().length) toBottom(false) } else closeDrawer() }).observe(root, { attributes: true, attributeFilter: ['class'] });

  cur = null; render();
})();
