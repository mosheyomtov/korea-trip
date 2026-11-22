/* ═══ בודי: the trip's AI chat. Renders into #s-chat, talks to /functions/v1/ai ═══
   Uses index.html globals: T, RG, H, STATE, favs, PL, REELS, todayStr, store, esc, say,
   loadServer, openReel, placeByKey, fmt, go/show, renderDay/renderPills, curDay. */
(() => {
  const root = document.getElementById('s-chat'); if (!root) return;
  // top-level lets/consts of the main script, read lazily and tolerant of renames
  const G = {
    REELS: () => typeof REELS !== 'undefined' ? REELS : [], favs: () => typeof favs !== 'undefined' ? favs : new Set(),
    PL: () => typeof PL !== 'undefined' ? PL : [], STATE: () => typeof STATE !== 'undefined' ? STATE : {},
    todayStr: () => typeof todayStr !== 'undefined' ? todayStr : new Date().toISOString().slice(0, 10),
    RG: () => typeof RG !== 'undefined' ? RG : null, H: () => typeof H !== 'undefined' ? H : null,
  };
  const g = n => G[n]();
  const E = typeof esc === 'function' ? esc : s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const S = typeof store === 'object' && store ? store : { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} } };
  const toast = t => typeof say === 'function' && say(t);
  const nav = s => (typeof show === 'function' ? show : typeof go === 'function' ? go : () => {})(s);
  const KEY = 'budi-chat';
  const MASCOT = cls => `<div class="budi ${cls}" aria-hidden="true"><i></i><i></i><b></b><b></b><u></u><s></s></div>`;
  const SUGS = [
    ['📅', 'מה יש לנו מחר?'], ['🗓️', 'תסדר לי את יום שישי'], ['🎄', 'תמצא סרטונים של שוק חג המולד'],
    ['🥙', 'איפה אוכלים כשר ליד המלון?'], ['🌦️', 'מה מזג האוויר בטיול?'], ['💛', 'תוסיף את Szimpla Kert לאהובים'],
  ];
  const STATUS = ['בודי חושב…', 'בודק בלו״ז…', 'מסתכל על המקומות שלכם…', 'מחפש סרטונים…', 'בודק מרחקים במפה…', 'כמעט מוכן…'];

  let msgs = S.get(KEY, []); if (!Array.isArray(msgs)) msgs = [];
  msgs = msgs.filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string');
  let busy = false, err = null, statusT = null;
  const save = () => S.set(KEY, msgs.slice(-60));

  root.innerHTML = `
    <div class="app-bar bd-head"><div class="wrap">
      ${MASCOT('bob')}
      <h1>בודי<small><span class="bd-dot"></span>העוזר של הטיול</small></h1>
      <button class="bd-new" id="bdNew"><span class="ms">edit_square</span>שיחה חדשה</button>
    </div></div>
    <div class="wrap"><div id="bdLog" class="bd-log"></div></div>
    <div class="bd-fade"></div>
    <form class="bd-comp" id="bdForm" autocomplete="off">
      <textarea id="bdIn" rows="1" placeholder="לשאול את בודי משהו…" enterkeyhint="send"></textarea>
      <button class="bd-send" id="bdSend" type="submit" aria-label="שליחה" disabled><span class="ms">send</span></button>
    </form>`;
  const log = root.querySelector('#bdLog'), inp = root.querySelector('#bdIn'), send = root.querySelector('#bdSend');

  /* ── light, safe markdown: escape first, then **bold**, [text](url), lists, line breaks ── */
  function md(src) {
    const inline = s => E(s)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, t, u) => `<a href="${u.replace(/"/g, '&quot;')}" target="_blank" rel="noopener">${t}</a>`)
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_, p, u) => `${p}<a href="${u}" target="_blank" rel="noopener">${u.length > 40 ? u.slice(0, 38) + '…' : u}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    const out = []; let list = null, para = [];
    const flushP = () => { if (para.length) { out.push(`<p>${para.join('<br>')}</p>`); para = [] } };
    const flushL = () => { if (list) { out.push(`<${list.t}>${list.items.map(x => `<li>${x}</li>`).join('')}</${list.t}>`); list = null } };
    for (const raw of String(src || '').split('\n')) {
      const line = raw.trim();
      const ul = line.match(/^[-•*]\s+(.*)$/), ol = line.match(/^\d+[.)]\s+(.*)$/);
      if (ul || ol) {
        flushP(); const t = ul ? 'ul' : 'ol';
        if (!list || list.t !== t) { flushL(); list = { t, items: [] } }
        list.items.push(inline((ul || ol)[1]));
      } else if (!line) { flushL(); flushP() }
      else { flushL(); para.push(inline(line)) }
    }
    flushL(); flushP();
    return out.join('');
  }

  /* ── cards ── */
  const REELS_ = () => g('REELS') || [];
  function vidsHtml(vs) {
    return `<div class="bd-vids">${vs.map(v => {
      const yt = v.source === 'youtube';
      return `<button class="bd-vid" data-bvid="${E(v.id)}" data-url="${E(v.url || '')}" style="${v.thumb ? `background-image:url('${E(v.thumb)}'),linear-gradient(160deg,#5BC0FF,#8B5CF6)` : ''}">
        <span class="src ${yt ? 'yt' : 'ig'}">${yt ? 'YouTube' : 'Reels'}</span><span class="bd-play"><span class="ms">play_arrow</span></span>
        ${v.title || v.place ? `<span class="t">${E(v.title || v.place)}</span>` : ''}</button>`;
    }).join('')}</div>`;
  }
  function placeHtml(c) {
    const onmap = c.key && typeof placeByKey === 'function' && placeByKey(c.key);
    const maps = c.maps || (c.lat ? `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((c.en || c.name || '') + ' Budapest')}`);
    return `<div class="bd-card bd-place"><span class="ic"><span class="ms">location_on</span></span><div class="bd-pi">
      <h4>${E(c.name)}</h4>${c.en && c.en !== c.name ? `<div class="en">${E(c.en)}</div>` : ''}${c.desc ? `<p>${E(c.desc)}</p>` : ''}
      <div class="acts"><a class="act" target="_blank" rel="noopener" href="${E(maps)}"><span class="ms">near_me</span>ניווט</a>
      ${onmap ? `<button class="act ghost" data-onmap="${E(c.key)}"><span class="ms">map</span>במפה</button>` : ''}</div></div></div>`;
  }
  function dayHtml(c) {
    const dt = typeof fmt === 'function' && /^\d{4}-\d\d-\d\d$/.test(c.date || '') ? fmt(c.date) : (c.date || '');
    const WDF = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const wd = /^\d{4}-\d\d-\d\d$/.test(c.date || '') ? 'יום ' + WDF[new Date(c.date + 'T12:00').getDay()] + ', ' : '';
    return `<div class="bd-card bd-day"><div class="hd"><span class="ic"><span class="ms">event_available</span></span>
      <div><b>${E(c.title || 'הלו״ז')}</b><small>${E(wd + dt)}</small></div><span class="tag">עודכן ✓</span></div>
      <div class="bd-tl">${(c.items || []).map(it => `<div><span class="tm">${E(it.t || '')}</span><span>${it.icon ? E(it.icon) + ' ' : ''}${E(it.name)}</span></div>`).join('')}</div>
      <button class="act ghost go" data-bday="${E(c.date || '')}"><span class="ms">calendar_month</span>לראות בלו״ז</button></div>`;
  }
  function cardsHtml(cards) {
    if (!Array.isArray(cards) || !cards.length) return '';
    const out = []; let vids = [];
    const flush = () => { if (vids.length) { out.push(vidsHtml(vids)); vids = [] } };
    for (const c of cards) {
      if (!c || !c.type) continue;
      if (c.type === 'video') { vids.push(c); continue }
      flush();
      if (c.type === 'place') out.push(placeHtml(c));
      else if (c.type === 'day') out.push(dayHtml(c));
    }
    flush();
    return out.join('');
  }

  /* ── render ── */
  function rowHtml(m, i) {
    if (m.role === 'user') return `<div class="bd-row bd-me"><div class="bd-col"><div class="bd-msg">${E(m.content)}</div></div></div>`;
    return `<div class="bd-row bot">${MASCOT('sm')}<div class="bd-col">${m.content ? `<div class="bd-msg">${md(m.content)}</div>` : ''}${cardsHtml(m.cards)}</div></div>`;
  }
  function render() {
    if (!msgs.length && !busy && !err) {
      log.innerHTML = `<div class="bd-hero">${MASCOT('big bob')}<div class="bd-shadow"></div>
        <h2>היי! אני <em>בודי</em>,<br>העוזר של הטיול לבודפשט</h2>
        <p>אני מכיר את הלו״ז, המלון, הטיסות וכל המקומות שסימנתם. אפשר לבקש ממני לשנות תוכניות, למצוא סרטונים ולהביא מיקומים.</p>
        <div class="bd-sugs">${SUGS.map(([e, t], i) => `<button class="bd-sug" data-sug="${E(t)}" style="animation-delay:${.15 + i * .05}s"><span class="e">${e}</span>${E(t)}</button>`).join('')}</div></div>`;
      return;
    }
    log.innerHTML = msgs.map(rowHtml).join('')
      + (err ? `<div class="bd-row bot err">${MASCOT('sm')}<div class="bd-col"><div class="bd-msg">אופס, לא הצלחתי לענות הפעם${err === true ? '' : ` (${E(err)})`}. בודקים שיש אינטרנט ומנסים שוב?<br><button class="bd-retry" data-retry><span class="ms">refresh</span>לנסות שוב</button></div></div></div>` : '')
      + (busy ? `<div class="bd-row bot" id="bdTyping">${MASCOT('sm')}<div class="bd-col"><div class="bd-msg bd-typing"><span class="bd-dots"><span></span><span></span><span></span></span><span class="bd-status" id="bdStatus">${STATUS[0]}</span></div></div></div>` : '');
  }
  const atChat = () => root.classList.contains('on');
  function toBottom(smooth = true) { if (atChat()) requestAnimationFrame(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })) }
  function startStatus() {
    clearInterval(statusT); let k = 0;
    statusT = setInterval(() => { const el = document.getElementById('bdStatus'); if (!el) return clearInterval(statusT); k = (k + 1) % STATUS.length; el.textContent = STATUS[k]; el.style.animation = 'none'; el.offsetWidth; el.style.animation = '' }, 1800);
  }

  /* ── context the assistant sees ── */
  function ctx() {
    const F = g('favs') || new Set(), P = g('PL') || [], st = g('STATE') || {};
    return {
      today: g('todayStr'), days: (T.days || []).map(d => ({ date: d.date, title: d.title, items: d.items })),
      plan: st.plan || null, favs: [...F], hotel: (T.hotels || [])[0], flights: T.flights,
      places: P.flatMap(c => c.items || []).map(it => ({ key: it.key, name: it.name, en: it.en, cat: it.cat, where: it.where, lat: it.lat, lng: it.lng, fav: F.has(it.key), reels: (it.reels || []).map(x => x.r && x.r.id).filter(Boolean).slice(0, 4) })),
    };
  }

  async function ask() {
    busy = true; err = null; render(); toBottom(); startStatus(); send.disabled = true;
    try {
      const rg = g('RG') || (T && T.reelglobe) || {};
      if (!rg.api) throw new Error('השרת לא מחובר');
      const headers = g('H') || { apikey: rg.anonKey, Authorization: 'Bearer ' + rg.anonKey, 'Content-Type': 'application/json' };
      const chat = msgs.filter(m => m.content).slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(rg.api + '/functions/v1/ai', { method: 'POST', headers, body: JSON.stringify({ trip: 'budapest', chat, ctx: ctx() }) });
      let o; try { o = await res.json() } catch { throw new Error('תשובה לא תקינה') }
      if (!res.ok && !o?.reply) throw new Error(o?.error || 'שגיאה ' + res.status);
      if (o.error && !o.reply) throw new Error(o.error);
      msgs.push({ role: 'assistant', content: String(o.reply || ''), cards: Array.isArray(o.cards) ? o.cards : [] }); save();
      busy = false; render(); toBottom();
      if (Array.isArray(o.changed) && o.changed.length) applyChanges(o.changed);
    } catch (e) {
      busy = false; err = (e && e.message && !/fetch|network/i.test(e.message)) ? e.message : true; render(); toBottom();
    } finally { clearInterval(statusT); send.disabled = !inp.value.trim() }
  }
  async function applyChanges(changed) {
    try { if (typeof loadServer === 'function') await loadServer() } catch {}
    try { if (typeof renderPills === 'function') renderPills(); if (typeof renderDay === 'function') renderDay() } catch {}
    const what = { plan: 'את הלו״ז', favs: 'את האהובים', adds: 'את המקומות' };
    const list = changed.map(c => what[c]).filter(Boolean);
    toast(`✨ בודי עדכן ${list.length ? list.join(' ו') : 'את הטיול'}`);
  }
  function submit(text) {
    text = String(text || '').trim(); if (!text || busy) return;
    err = null; msgs.push({ role: 'user', content: text }); save();
    inp.value = ''; grow(); ask();
  }

  /* ── wiring ── */
  function grow() { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 132) + 'px'; send.disabled = busy || !inp.value.trim() }
  inp.addEventListener('input', grow);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(inp.value) } });
  root.querySelector('#bdForm').addEventListener('submit', e => { e.preventDefault(); submit(inp.value) });
  root.querySelector('#bdNew').addEventListener('click', () => {
    if (busy) return; msgs = []; err = null; save(); render(); scrollTo({ top: 0, behavior: 'smooth' });
  });
  root.addEventListener('click', e => {
    const s = e.target.closest('[data-sug]'); if (s) return submit(s.dataset.sug);
    if (e.target.closest('[data-retry]')) { err = null; return ask() }
    const v = e.target.closest('[data-bvid]');
    if (v) {
      const r = REELS_().find(x => String(x.id) === v.dataset.bvid);
      if (r && typeof openReel === 'function') openReel(r); else if (v.dataset.url) window.open(v.dataset.url, '_blank', 'noopener');
      return;
    }
    const d = e.target.closest('[data-bday]');
    if (d) {
      const i = (T.days || []).findIndex(x => x.date === d.dataset.bday);
      if (i >= 0) { try { curDay = i } catch {} }
      nav('plan');
      try { if (typeof renderPills === 'function') renderPills(); if (typeof renderDay === 'function') renderDay() } catch {}
    }
    // [data-onmap] is handled by index.html's document click handler
  });
  // when the tab opens: jump to the latest message
  new MutationObserver(() => { if (atChat() && msgs.length) toBottom(false) }).observe(root, { attributes: true, attributeFilter: ['class'] });

  render();
})();
