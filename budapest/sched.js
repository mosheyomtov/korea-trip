/* ═══ The smart schedule page (#s-sched): the AI builds a plan from the places they hearted, shown as a timeline
   of cards per day, with weather, suggestions to add or drop, a map of each day's route, and Duna in a drawer to talk about it.
   Uses index.html globals: T, STATE, PL, favs, toggleFav, afterChange, placeByKey, thHtml, REELS, openReel, openPlace,
   gmapsUrl, getMap, setMarkers, fitTo, aiApi, api, store, say, esc, D, WD, WDF, fmt, go, renderDay, renderPills, curDay,
   and window.Duna from chat.js. ═══ */
(() => {
  const root = document.getElementById('s-sched'); if (!root) return;
  const star = (c = '') => window.Duna ? Duna.star(c) : '';
  const LOAD = ['בודקת את תחזית מזג האוויר…', 'מקבצת מקומות לפי שכונות…', 'שומרת על שבת ועל שעות הפתיחה…', 'מחפשת מה עוד כדאי להוסיף…', 'מסדרת שעות לכל יום…', 'עוד רגע…'];

  let draft = store.get('sched-draft', null);     // a proposal they have not approved yet (kept on this phone)
  let dayI = Math.max(0, T.days.findIndex(d => d.date === todayStr));
  let view = 'list', loading = false, error = null, loadT = null;
  const plan = () => draft || (STATE.plan?.approved ? STATE.plan : null);
  const pday = (p, date) => p?.days?.find(d => d.date === date);
  const saveDraft = () => store.set('sched-draft', draft);

  /* ── skeleton: the map stays in the page so Google Maps is created once ── */
  root.innerHTML = `
    <div class="sc-top">
      <button class="sc-ib" id="scBack" aria-label="חזרה"><span class="ms">arrow_forward</span></button>
      <div class="sc-ttl"><b>הלו״ז החכם</b><small id="scSub"></small></div>
      <div class="seg icons sc-seg" id="scView"><button data-v="list" class="on" aria-label="טיימליין"><span class="ms">view_list</span></button><button data-v="map" aria-label="מפה"><span class="ms">map</span></button></div>
      <button class="sc-ib sc-duna" id="scAsk" aria-label="לשאול את דונה על הלו״ז">${star()}</button>
    </div>
    <div class="sc-pills" id="scPills"></div>
    <div id="scList" class="sc-wrap"></div>
    <div id="scMapView" class="sc-wrap" hidden><div class="sc-map" id="scMap"></div><div id="scStops"></div></div>
    <div class="sc-bar" id="scBar"></div>`;
  const $$ = s => root.querySelector(s);

  /* ── weather ── */
  const wIcon = c => c == null ? 'thermostat' : c <= 1 ? 'sunny' : c <= 3 ? 'partly_cloudy_day' : c <= 48 ? 'foggy' : c <= 67 || (c >= 80 && c <= 82) ? 'rainy' : c <= 86 ? 'weather_snowy' : 'thunderstorm';
  const wLine = w => w ? `${w.tmin}°–${w.tmax}°${w.rain >= 30 ? ` · ${w.rain}% משקעים` : ''}${w.wind >= 30 ? ' · רוח' : ''}` : '';

  /* ── rendering ── */
  function render() {
    const p = plan();
    $$('#scSub').textContent = loading ? 'בונה…' : draft ? 'הצעה, עוד לא נשמרה' : p ? `אושר ${new Date(p.approved).toLocaleDateString('he-IL')}` : '';
    $$('#scView').hidden = !p || loading;
    $$('#scView').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === view));
    $$('#scAsk').hidden = !p || loading;
    if (loading || !p) {
      $$('#scPills').innerHTML = ''; $$('#scMapView').hidden = true; $$('#scList').hidden = false; $$('#scBar').innerHTML = '';
      $$('#scList').innerHTML = loading ? `<div class="sc-load">${star('float')}<h2>בונה לכם את הלו״ז</h2><p id="scLoadT">${LOAD[0]}</p><div class="sc-bars"><i></i><i></i><i></i></div></div>`
        : error ? `<div class="sc-load">${star()}<h2>לא הצלחתי לסדר הפעם</h2><p>${esc(error)}</p><button class="big-btn" data-a="again"><span class="ms">refresh</span>לנסות שוב</button></div>`
        : !favs.size ? `<div class="sc-load">${star()}<h2>קודם מסמנים ♥</h2><p>הלו״ז נבנה רק מהמקומות שסימנתם בלב. מסמנים בעמוד המקומות או בגילוי, וחוזרים לכאן.</p><button class="big-btn" data-a="places"><span class="ms">favorite</span>למקומות</button></div>`
        : `<div class="sc-load">${star()}<h2>עוד אין לו״ז</h2><button class="big-btn" data-a="again"><span class="ms">auto_awesome</span>לבנות לו״ז</button></div>`;
      return;
    }
    renderPillsSc(p);
    $$('#scList').hidden = view !== 'list'; $$('#scMapView').hidden = view !== 'map';
    if (view === 'list') renderList(p); else renderMap(p);
    $$('#scBar').innerHTML = draft
      ? `<button class="big-btn" data-a="ok"><span class="ms">check</span>מאשרים את הלו״ז</button><button class="sc-mini" data-a="again" aria-label="לבנות מחדש"><span class="ms">refresh</span></button>`
      : `<button class="big-btn ghost" data-a="again"><span class="ms">refresh</span>לבנות מחדש</button><button class="sc-mini" data-a="undo" aria-label="לבטל את הסידור"><span class="ms">delete</span></button>`;
  }
  function renderPillsSc(p) {
    $$('#scPills').innerHTML = `<div class="day-pills">${T.days.map((d, i) => { const w = pday(p, d.date)?.weather; return `
      <button class="day-pill ${i === dayI ? 'on' : ''}" data-day-i="${i}"><span class="n">${D(d.date).getDate()}.${D(d.date).getMonth() + 1}</span><span class="d">${WD[D(d.date).getDay()]}</span>
        <span class="l">${w ? `<span class="ms">${wIcon(w.code)}</span>${w.tmax}°` : 'יום ' + (i + 1)}</span></button>` }).join('')}</div>`;
    requestAnimationFrame(() => $$('#scPills .on')?.scrollIntoView({ inline: 'center', block: 'nearest' }));
  }
  const reelsOf = it => (placeByKey(it.place)?.reels || []).map(x => x.r).filter(Boolean);
  function card(it, i) {
    const pl = placeByKey(it.place), rs = reelsOf(it), th = rs[0] && (rs[0].thumb || '');
    return `<div class="tl-item" style="animation-delay:${i * .04}s"><div class="tl-dot"></div>
      <div class="tl-card sc-card" data-i="${i}">
        <div class="tl-top"><span class="tl-time">${esc(it.t || '')}</span><span class="tl-emoji">${it.icon || '📍'}</span>
          <span class="tl-name">${esc(it.name)}${it.desc ? `<small>${esc(it.desc)}</small>` : ''}</span>
          ${th ? `<span class="sc-th" style="background-image:url('${esc(th)}')"><span class="ms">play_arrow</span></span>` : rs.length ? `<span class="sc-th none"><span class="ms">smart_display</span></span>` : ''}
          <span class="ms tl-chev">chevron_left</span></div>
        <div class="tl-body">
          ${it.why_he ? `<div class="sc-why"><span class="ms fill">auto_awesome</span><div><b>למה כאן ועכשיו</b>${esc(it.why_he)}</div></div>` : ''}
          ${pl?.desc && pl.desc !== it.desc ? `<div class="tl-desc">${esc(pl.desc)}</div>` : ''}
          ${rs.length ? `<div class="sc-lbl">סרטונים מהמקום</div><div class="reel-row">${rs.slice(0, 6).map(r => thHtml(r)).join('')}</div>` : it.place ? '<div class="sc-none">עוד אין סרטון על המקום הזה</div>' : ''}
          <div class="acts">${it.lat ? `<a class="act" target="_blank" rel="noopener" href="${gmapsUrl(it.lat, it.lng)}"><span class="ms">near_me</span>ניווט</a><button class="act ghost" data-a="onmap" data-i="${i}"><span class="ms">map</span>במפה</button>` : ''}
            ${pl ? `<button class="act ghost" data-a="place" data-i="${i}"><span class="ms">info</span>על המקום</button>` : ''}
            ${it.place ? `<button class="act ghost sc-rm" data-a="rm" data-i="${i}"><span class="ms">delete</span>להוריד</button>` : ''}</div>
        </div></div></div>`;
  }
  function sugHtml(s, k) {
    const add = s.kind === 'add', d = T.days.find(x => x.date === s.date), pl = placeByKey(s.place), rs = (pl?.reels || []).map(x => x.r).filter(Boolean);
    return `<div class="sc-sug ${add ? 'add' : 'rm'} ${s.state ? 'done' : ''}">
      <div class="sc-sug-h"><span class="ic"><span class="ms">${add ? 'add_circle' : 'remove_circle'}</span></span>
        <div><small>${add ? 'כדאי להוסיף' : 'אולי לוותר'}${d ? ` · יום ${WDF[D(d.date).getDay()]}${s.t ? ' ' + esc(s.t) : ''}` : ''}</small><b>${s.icon || ''} ${esc(s.name_he)}</b></div></div>
      <p>${esc(s.reason_he)}</p>
      ${add && rs.length ? `<div class="reel-row">${rs.slice(0, 4).map(r => thHtml(r)).join('')}</div>` : ''}
      ${s.state ? `<div class="sc-sug-st">${s.state === 'yes' ? (add ? '✓ נוסף ללו״ז וסומן ♥' : '✓ הוסר מהלו״ז') : 'השארנו כמו שהיה'}</div>`
        : `<div class="acts"><button class="act" data-a="sug-yes" data-k="${k}"><span class="ms">${add ? 'add' : 'remove'}</span>${add ? 'להוסיף' : 'להוריד'}</button><button class="act ghost" data-a="sug-no" data-k="${k}">${add ? 'לא צריך' : 'להשאיר'}</button></div>`}
    </div>`;
  }
  function renderList(p) {
    const d = T.days[dayI], pd = pday(p, d.date) || { title: d.title, items: d.items || [] }, items = pd.items || [], w = pd.weather;
    const sugs = (p.suggestions || []).map((s, k) => [s, k]);
    const here = sugs.filter(([s]) => s.date === d.date), open = sugs.filter(([s]) => !s.state).length;
    $$('#scList').innerHTML = `
      ${dayI === 0 && p.overview_he ? `<div class="info-block ib-ai sc-ov"><div class="info-lbl"><span class="ms fill">auto_awesome</span>ההיגיון של הסידור</div>${esc(p.overview_he)}</div>` : ''}
      ${open && !here.some(([s]) => !s.state) ? `<button class="sc-chip" data-a="to-sug"><span class="ms">tips_and_updates</span>${open} הצעות של ה-AI בימים אחרים</button>` : ''}
      <div class="sc-dayh"><div><h2>${esc(pd.title || d.title)}</h2><span>יום ${WDF[D(d.date).getDay()]}, ${fmt(d.date)}</span></div>
        ${w ? `<div class="sc-wx"><span class="ms">${wIcon(w.code)}</span><b>${w.tmin}°–${w.tmax}°</b>${w.rain >= 30 ? `<small>${w.rain}%</small>` : ''}</div>` : ''}</div>
      ${pd.weather_he ? `<div class="sc-wxline"><span class="ms">${wIcon(w?.code)}</span>${esc(pd.weather_he)}</div>` : ''}
      ${pd.why_he ? `<div class="sc-dwhy">${esc(pd.why_he)}</div>` : ''}
      ${items.length ? `<div class="timeline">${items.map(card).join('')}</div>` : `<div class="empty"><span class="ms">event_note</span><b>היום הזה פנוי</b>אפשר לבקש מדונה למלא אותו</div>`}
      ${here.length ? `<div class="sc-sec" id="scSugs"><span class="ms">tips_and_updates</span>ההצעות של ה-AI ליום הזה</div>${here.map(([s, k]) => sugHtml(s, k)).join('')}` : ''}
      ${dayI === T.days.length - 1 && p.left_out_he ? `<div class="info-block ib-tip" style="margin-top:14px"><div class="info-lbl"><span class="ms">playlist_remove</span>מה נשאר בחוץ</div>${esc(p.left_out_he)}</div>` : ''}
      <button class="sc-askday" data-a="ask"><span class="sc-askic">${star()}</span><span><b>לדבר עם דונה על היום הזה</b><small>להזיז, להחליף, לשאול מה עושים אם יורד גשם</small></span><span class="ms">chevron_left</span></button>`;
  }

  /* ── map: the day's stops in order, joined by a route line ── */
  // markers 1..n for the day's stops, the hotel, and a line with arrows between them
  // a schedule item on the map: its own coordinates, else the place it points to (incl. places geocoded on this phone)
  const located = items => items.map(it => { if (it.lat) return it; const p = it.place && placeByKey(it.place); return p?.lat ? { ...it, lat: p.lat, lng: p.lng } : it }).filter(it => it.lat);
  async function drawRoute(id, el, items) {
    const h = T.hotels?.[0], stops = located(items);
    let m; try { m = await getMap(id, el) } catch { el.innerHTML = '<div class="empty">המפה לא נטענה</div>'; return null }
    const pin = (html, cls) => { const d = document.createElement('div'); d.className = 'sc-pin ' + cls; d.innerHTML = html; return d };
    const list = stops.map((it, n) => [{ lat: it.lat, lng: it.lng }, pin(`<b>${n + 1}</b>`, '')]);
    if (h?.lat) list.push([{ lat: h.lat, lng: h.lng }, pin('<span class="ms">hotel</span>', 'hotel')]);
    setMarkers(m, list);
    if (m.line) m.line.setMap(null);
    m.line = null;
    const path = stops.map(it => ({ lat: it.lat, lng: it.lng }));
    if (path.length > 1) m.line = new google.maps.Polyline({ map: m.gm, path, geodesic: true, strokeColor: '#3B6EF5', strokeOpacity: .85, strokeWeight: 4,
      icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.6, strokeColor: '#3B6EF5', fillColor: '#3B6EF5', fillOpacity: 1 }, offset: '50%', repeat: '90px' }] });
    m.stops = stops;
    google.maps.event.trigger(m.gm, 'resize');
    fitTo(m, path.length ? path : h?.lat ? [h] : [], { top: 50, bottom: 40, left: 40, right: 40 });
    if (path.length === 1) m.gm.setZoom(15);
    return m;
  }
  const stopsHtml = items => { const stops = located(items); return stops.length ? `<ol class="sc-stops">${stops.map((it, n) => `<li data-stop="${n}"><span class="no">${n + 1}</span><span class="tm">${esc(it.t || '')}</span><span class="nm">${it.icon || ''} ${esc(it.name)}</span><a target="_blank" rel="noopener" href="${gmapsUrl(it.lat, it.lng)}" aria-label="ניווט"><span class="ms">near_me</span></a></li>`).join('')}</ol>`
    : `<div class="empty"><span class="ms">map</span><b>אין ביום הזה מקומות על המפה</b></div>` };
  const panTo = (id, n) => { try { const m = MAPS[id], it = m.stops[n]; m.gm.panTo({ lat: it.lat, lng: it.lng }); m.gm.setZoom(16) } catch {} };
  async function renderMap(p) {
    const items = pday(p, T.days[dayI].date)?.items || [];
    $$('#scStops').innerHTML = stopsHtml(items);
    await drawRoute('sched', $$('#scMap'), items);
  }
  /* ── building ── */
  async function makePlan() {
    if (!favs.size) { draft = null; saveDraft(); error = null; return render() }
    loading = true; error = null; render(); window.scrollTo({ top: 0 });
    let k = 0; clearInterval(loadT); loadT = setInterval(() => { const el = document.getElementById('scLoadT'); if (el) el.textContent = LOAD[k = Math.min(k + 1, LOAD.length - 1)] }, 4200);
    try {
      const base = new Set((window.PLACES || []).flatMap(c => c.items.map(it => it.en || it.name)));
      const keys = [...favs];
      const extra = PL.flatMap(c => c.items).filter(it => favs.has(it.key) && !base.has(it.key)).map(it => ({ place: it.key, name: it.name, desc: it.desc, lat: it.lat, lng: it.lng }));
      const f = T.flights || [];
      const o = await aiApi({ plan: true, favs: keys.filter(k => base.has(k)), extra,
        days: T.days.map(d => ({ date: d.date, weekday: WDF[D(d.date).getDay()], title: d.title, fixed: d.items })),
        hotel: T.hotels[0], facts: `Hotel ${T.hotels[0]?.name}, ${T.hotels[0]?.addr}. Flights: ${f.map(x => `${x.dir} ${x.date} ${x.from}->${x.to} dep ${x.dep} arr ${x.arr}`).join('; ')}. Arrival day: they reach the hotel ~23:00, so nothing that evening. Last day: leave the hotel by 11:30.` });
      if (o.error === 'no_favs') throw new Error('אין מקומות מסומנים ב-♥');
      if (o.error || !o.plan) throw new Error(o.error || 'השרת לא החזיר לו״ז');
      draft = o.plan; saveDraft();
      const first = T.days.findIndex(d => pday(draft, d.date)?.items?.some(it => it.place)); if (first >= 0) dayI = first;
    } catch (e) { error = e.message || 'משהו השתבש, נסו שוב עוד רגע' }
    finally { loading = false; clearInterval(loadT); render() }
  }
  // the plan being shown changed: a draft stays on this phone, an approved plan is saved for both
  function commit(p) {
    if (draft) { draft = p; saveDraft() }
    else { STATE.plan = p; store.set('state', STATE); api({ approve: p }).catch(() => say('לא הצלחתי לשמור בשרת, נסו שוב')); try { renderDay() } catch {} }
    render(); drawerBlock();
  }
  const clone = o => JSON.parse(JSON.stringify(o));
  function dayOf(p, date) {
    let d = pday(p, date);
    if (!d) { const b = T.days.find(x => x.date === date); d = { date, title: b?.title || '', why_he: '', items: clone(b?.items || []) }; p.days = [...(p.days || []), d].sort((a, b) => a.date.localeCompare(b.date)) }
    return d;
  }

  /* ── actions ── */
  root.addEventListener('click', e => {
    const pill = e.target.closest('[data-day-i]');
    if (pill) { dayI = +pill.dataset.dayI; render(); drawerBlock(); return }
    const st = e.target.closest('[data-stop]');
    if (st) return panTo('sched', +st.dataset.stop);
    const v = e.target.closest('#scView button');
    if (v) { view = v.dataset.v; render(); return }
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a) { const c = e.target.closest('.sc-card'); if (c && !e.target.closest('a,button')) c.classList.toggle('open'); return }
    const el = e.target.closest('[data-a]'), p = plan(), d = T.days[dayI];
    const item = () => (pday(p, d.date)?.items || [])[+el.dataset.i];
    if (a === 'again') makePlan();
    else if (a === 'places') { go('map'); try { setView('list') } catch {} }
    else if (a === 'ok' && draft) {
      const ap = { ...draft, approved: new Date().toISOString() };
      STATE.plan = ap; store.set('state', STATE); draft = null; saveDraft();
      api({ approve: ap }).catch(() => say('לא הצלחתי לשמור בשרת, נסו שוב'));
      try { renderPills(); renderDay() } catch {} say('הלו״ז נשמר. פס תראה אותו גם'); render();
    }
    else if (a === 'undo') { if (!STATE.plan) return; STATE.plan = null; store.set('state', STATE); api({ unapprove: true }).catch(() => {}); try { renderDay() } catch {} say('הסידור בוטל'); render() }
    else if (a === 'place') { const pl = placeByKey(item()?.place); if (pl) openPlace(pl) }
    else if (a === 'onmap') { view = 'map'; render() }
    else if (a === 'rm') { const it = item(); if (!it) return; const np = clone(p); const nd = dayOf(np, d.date); nd.items = nd.items.filter(x => !(x.t === it.t && x.name === it.name)); commit(np); say(`הורדתי את ${it.name}`) }
    else if (a === 'sug-yes' || a === 'sug-no') {
      const np = clone(p), s = np.suggestions[+el.dataset.k]; if (!s) return;
      s.state = a === 'sug-yes' ? 'yes' : 'no';
      if (a === 'sug-yes') {
        const nd = dayOf(np, s.date);
        if (s.kind === 'add') {
          const pl = placeByKey(s.place);
          nd.items = [...nd.items, { t: s.t, icon: s.icon, name: s.name_he, desc: s.desc || pl?.desc || '', why_he: s.reason_he, place: s.place, ...(s.lat ? { lat: s.lat, lng: s.lng } : pl?.lat ? { lat: pl.lat, lng: pl.lng } : {}) }].sort((x, y) => String(x.t).localeCompare(String(y.t)));
          if (!favs.has(s.place)) { toggleFav(s.place); try { afterChange() } catch {} }
        } else nd.items = nd.items.filter(x => x.place !== s.place);
      }
      commit(np);
    }
    else if (a === 'to-sug') { const k = (p.suggestions || []).find(s => !s.state); const i = T.days.findIndex(x => x.date === k?.date); if (i >= 0) { dayI = i; render(); requestAnimationFrame(() => $$('#scSugs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })) } }
    else if (a === 'ask') openDrawer(d.date);
  });
  $$('#scBack').onclick = () => { if (history.state && history.state.d > 0) history.back(); else go('plan') };
  $$('#scAsk').onclick = () => openDrawer(T.days[dayI].date);

  // entering the page: show the draft or the approved plan, or build one
  let wasOn = false;
  new MutationObserver(() => {
    const on = root.classList.contains('on'); if (on === wasOn) return; wasOn = on;
    if (!on) return closeDrawer();
    if (!plan() && !loading) makePlan(); else render();
  }).observe(root, { attributes: true, attributeFilter: ['class'] });
  // the plan screen's button opens this page
  const btn = document.getElementById('aiPlanBtn'); if (btn) btn.onclick = () => go('sched');

  /* ── Duna's drawer about the schedule (opens here and from the plan screen) ── */
  const dr = document.createElement('div');
  dr.className = 'sc-dr'; dr.innerHTML = `<div class="sc-dim" data-x></div><div class="sc-sheet" role="dialog" aria-label="דונה על הלו״ז">
    <div class="grab"></div>
    <div class="sc-dh">${star()}<div><b>דונה</b><small id="scDrSub"></small></div><button class="sc-ib" data-x aria-label="סגירה"><span class="ms">close</span></button></div>
    <div class="sc-dbody" id="scDrBody"><div id="scBlock"></div><div id="scLog"></div></div>
    <form class="sc-comp" id="scForm"><textarea id="scIn" rows="1" placeholder="מה לשנות ביום הזה?"></textarea><button id="scSend" aria-label="שליחה"><span class="ms">arrow_upward</span></button></form></div>`;
  document.body.appendChild(dr);
  const Q = s => dr.querySelector(s);
  let drDate = null, talks = {}, drBusy = false;
  const SUGQ = ['תסדרי את היום כך שיהיה פחות הליכה', 'מה עושים אם יורד גשם?', 'תוסיפי זמן למנוחה בצהריים', 'איפה אוכלים כשר באזור?'];
  function drawerBlock() {
    if (!dr.classList.contains('on')) return;
    const p = plan() || { days: [] }, b = T.days.find(x => x.date === drDate), pd = pday(p, drDate) || { title: b?.title, items: b?.items || [] }, w = pd.weather;
    Q('#scDrSub').textContent = draft ? 'על ההצעה ללו״ז, שינויים נשמרים בהצעה' : 'על הלו״ז שלכם, שינויים נשמרים לשניכם';
    Q('#scBlock').innerHTML = `<div class="sc-block"><div class="sc-bh"><b>${esc(pd.title || b?.title || '')}</b><span>יום ${WDF[D(drDate).getDay()]}, ${fmt(drDate)}${w ? ` · <span class="ms">${wIcon(w.code)}</span> ${wLine(w)}` : ''}</span></div>
      ${(pd.items || []).length ? `<ol>${pd.items.map(it => `<li><span class="tm">${esc(it.t || '')}</span>${it.icon || ''} ${esc(it.name)}</li>`).join('')}</ol>` : '<div class="sc-none">היום עוד פנוי</div>'}</div>`;
  }
  function drawLog() {
    const list = talks[drDate] || [];
    Q('#scLog').innerHTML = (list.length ? list.map(m => m.role === 'user' ? `<div class="sc-m u">${esc(m.content)}</div>`
      : `<div class="sc-m a">${m.content ? (window.Duna ? Duna.md(m.content) : esc(m.content)) : ''}${m.err ? `<span class="sc-err">${esc(m.err)}</span>` : ''}</div>`).join('')
      : `<div class="sc-qs">${SUGQ.map(q => `<button data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>`)
      + (drBusy ? `<div class="sc-m a busy"><span class="dn-think" id="scThink">דונה חושבת…</span></div>` : '');
    const body = Q('#scDrBody'); requestAnimationFrame(() => body.scrollTop = body.scrollHeight);
  }
  function openDrawer(date) { drDate = date; dr.classList.add('on'); drawerBlock(); drawLog() }
  function closeDrawer() { if (dr.classList.contains('on')) dr.classList.remove('on') }
  async function send(text) {
    text = String(text || '').trim(); if (!text || drBusy || !window.Duna) return;
    const list = talks[drDate] ||= []; list.push({ role: 'user', content: text }); Q('#scIn').value = '';
    drBusy = true; drawLog();
    try {
      const o = await Duna.talk({ chat: list.filter(m => m.content).slice(-12).map(m => ({ role: m.role, content: m.content })), focus: drDate, ...(draft ? { draft } : {}) },
        t => { const el = document.getElementById('scThink'); if (el) el.textContent = t });
      list.push({ role: 'assistant', content: String(o.reply || '') });
      if (o.draft && draft) { draft = { ...draft, ...o.draft, suggestions: draft.suggestions }; saveDraft() }
      if (Array.isArray(o.changed) && o.changed.some(c => c !== 'draft')) await Duna.changed(o.changed, true);
      render(); drawerBlock();
      if (o.changed?.length) say('דונה עדכנה את הלו״ז');
    } catch (e) { list.push({ role: 'assistant', content: '', err: e.message || 'לא הצלחתי לענות, ננסה שוב?' }) }
    finally { drBusy = false; drawLog() }
  }
  dr.addEventListener('click', e => {
    if (e.target.closest('[data-x]')) return closeDrawer();
    const q = e.target.closest('[data-q]'); if (q) send(q.dataset.q);
  });
  Q('#scForm').addEventListener('submit', e => { e.preventDefault(); send(Q('#scIn').value) });
  Q('#scIn').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(Q('#scIn').value) } });
  { // drag down to close
    const sh = Q('.sc-sheet'); let y0 = null, dy = 0;
    sh.addEventListener('touchstart', e => { if (!e.target.closest('.grab,.sc-dh')) return; y0 = e.touches[0].clientY; dy = 0; sh.style.transition = 'none' }, { passive: true });
    sh.addEventListener('touchmove', e => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = `translateY(${dy}px)` }, { passive: true });
    sh.addEventListener('touchend', () => { if (y0 === null) return; y0 = null; sh.style.transition = ''; sh.style.transform = ''; if (dy > 90) closeDrawer() });
  }
  /* ── the plan screen: next to "הלו״ז", the AI button (opens this page) and list/map icons (the map shows the day's route) ── */
  const sec = document.getElementById('planNote')?.parentElement, dayEl = document.getElementById('day');
  if (sec && dayEl) {
    sec.classList.add('sc-plansec');
    sec.insertAdjacentHTML('beforeend', `<div class="sc-tools"><button class="sc-aibtn" id="planAi" aria-label="סידור חכם עם AI"><span class="ms fill">auto_awesome</span></button>
      <div class="seg icons sc-seg" id="planView"><button data-v="list" class="on" aria-label="רשימה"><span class="ms">view_list</span></button><button data-v="map" aria-label="מפה"><span class="ms">map</span></button></div></div>`);
    dayEl.insertAdjacentHTML('afterend', `<div id="planMapView" hidden><div class="sc-map" id="planMap"></div><div id="planStops"></div></div>`);
    let pv = 'list';
    const drawPlan = () => {
      document.querySelectorAll('#planView button').forEach(b => b.classList.toggle('on', b.dataset.v === pv));
      dayEl.hidden = pv !== 'list'; document.getElementById('planMapView').hidden = pv !== 'map';
      if (pv !== 'map') return;
      const items = dayItems(T.days[curDay]);
      document.getElementById('planStops').innerHTML = stopsHtml(items);
      drawRoute('plan', document.getElementById('planMap'), items);
    };
    document.getElementById('planView').onclick = e => { const b = e.target.closest('button'); if (b) { pv = b.dataset.v; drawPlan() } };
    document.getElementById('planAi').onclick = () => go('sched');
    document.getElementById('planStops').onclick = e => { const x = e.target.closest('[data-stop]'); if (x && !e.target.closest('a')) panTo('plan', +x.dataset.stop) };
    const orig = renderDay;
    renderDay = function () { orig.apply(this, arguments); drawPlan() };   // a new day or a new plan redraws the route
  }
  window.Sched = { open: () => go('sched'), ask: openDrawer, close: closeDrawer };
})();
