// ═══════════════════════════════════════════════════════════
//  כל פרטי הטיול נמצאים בקובץ הזה. משנים כאן, דוחפים לגיטהאב,
//  והאתר מתעדכן לכל מי שפותח את הקישור.
//  הלו"ז לפי ימים ייבנה מתוך רשימת המקומות (places.js)
// ═══════════════════════════════════════════════════════════

window.TRIP = {
  title: 'בודפשט',
  subtitle: 'הטיול שלנו',
  travelers: ['משה', 'פס'],
  start: '2026-11-25',          // YYYY-MM-DD
  end:   '2026-11-30',
  center: [47.4979, 19.0402],   // מרכז המפה

  // מפתח Google Maps (Maps JavaScript API + Geocoding API), מוגבל ל-mosheyomtov.github.io/*
  // כשהוא ריק, המפה מציגה מקום אחד בכל פעם בלי מפתח
  googleMapsKey: 'AIzaSyB63LfTOff_65UkNG1vMTZ3NKLaEqSNhc4',   // המפתח של ג׳ורני (משה אישר)

  // קישור ל-ReelGlobe. כשהחיבור יהיה מוכן, הגלובוס יוצג בלשונית "ריילים"
  reelglobe: {
    url: 'https://reelglobe.mosheyt2.workers.dev/',
    focus: 'Budapest',
    // השרת של ReelGlobe (סופרבייס). כשממלאים את שני אלה, שיתוף ריילים מאינסטגרם מתחיל לעבוד
    api: 'https://gtlxkkkbnowcudhwisqe.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bHhra2tibm93Y3VkaHdpc3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxMTk3MjgsImV4cCI6MjExMDY5NTcyOH0.hGDdjvVtzBaFZstqf7R5apPvDmAnvh7SlBzJ1Qwj7kE',   // מפתח ציבורי (anon), בטוח להיות בקוד
  },

  // טיסות Wizz Air (שעות מקומיות. בודפשט שעה אחורה מישראל)
  flights: [
    { dir: 'הלוך', date: '2026-11-25', from: 'TLV', to: 'BUD', code: 'W6 2328', dep: '19:30 · טרמינל 1', arr: '22:05' },
    { dir: 'חזור', date: '2026-11-30', from: 'BUD', to: 'TLV', code: 'W6 2327', dep: '14:20 · טרמינל 2B', arr: '18:35' },
  ],

  hotels: [
    { name: 'Barceló Budapest', area: 'Király utca 16 · רובע 6, ליד חצר גוז׳דו', from: '2026-11-25', to: '2026-11-30',
      addr: 'Barceló Budapest, Király utca 16', lat: 47.4987, lng: 19.0567, note: '' },
  ],

  // tags: food, sight, bath, night, move, shop
  days: [
    { date: '2026-11-25', title: 'נחיתה וערב ראשון', items: [
      { t: '19:30', icon: '✈️', name: 'טיסה לבודפשט · W6 2328', desc: 'Wizz Air מנתב״ג, טרמינל 1. כדאי להגיע לשדה בסביבות 16:30.' },
      { t: '22:05', icon: '🛬', name: 'נחיתה בבודפשט', desc: 'שעון מקומי (שעה אחורה מישראל). ביקורת דרכונים ומזוודות.' },
      { t: '22:45', icon: '🚕', name: 'Bolt למלון', desc: 'כ-35 דקות.' },
      { t: '23:30', icon: '🏨', name: 'צ׳ק-אין ב-Barceló', desc: 'Király utca 16.', lat: 47.4987, lng: 19.0567 },
    ] },
    { date: '2026-11-26', title: 'יום מקורה: קניות, שוק ופרלמנט מואר', items: [
      { t: '09:00', icon: '☕', name: 'ארוחת בוקר ב-Tel Aviv Cafe', desc: 'כשר חלבי, Kazinczy 28. חלופות קרובות: קפה תמר או Cirkusz Café.', place: 'Tel Aviv Cafe Budapest Kazinczy', lat: 47.4980, lng: 19.0618 },
      { t: '10:30', icon: '🕍', name: 'בית הכנסת הגדול', desc: 'ברחוב דוהאני, 5 דקות הליכה. בשבת סגור ובשישי נסגר מוקדם.', place: 'Dohány Street Synagogue', lat: 47.4960, lng: 19.0607 },
      { t: '12:00', icon: '🛍️', name: 'קניון ארנה', desc: 'הבחירה הראשונה של פז. חלופה: וסטאנד.', place: 'Arena Mall Budapest', lat: 47.4986, lng: 19.0907 },
      { t: '13:30', icon: '🍽️', name: 'ארוחת צהריים בקניון', desc: 'באזור האוכל של ארנה.' },
      { t: '15:30', icon: '🚇', name: 'מטרו M4 לשוק הגדול', desc: 'מתחנת Keleti ישר לתחנת Fővám tér.' },
      { t: '16:00', icon: '🧺', name: 'השוק הגדול', desc: 'תבלינים, מזכרות ודוכנים. נסגר ב-18:00.', place: 'Central Market Hall Budapest', lat: 47.4870, lng: 19.0585 },
      { t: '18:30', icon: '🏛️', name: 'הפרלמנט המואר', desc: 'הבניין בתאורת לילה.', place: 'Hungarian Parliament Building', lat: 47.5071, lng: 19.0457 },
      { t: '18:50', icon: '👞', name: 'אנדרטת הנעליים על הדנובה', desc: '5 דקות הליכה מהפרלמנט.', place: 'Shoes on the Danube Bank', lat: 47.5045, lng: 19.0448 },
      { t: '19:10', icon: '🦅', name: 'כיכר החירות', desc: 'בדרך למסעדה.', place: 'Szabadság tér', lat: 47.5030, lng: 19.0505 },
      { t: '19:30', icon: '🍝', name: 'ארוחת ערב ב-Pomo D\'Oro', desc: 'ליד הבזיליקה. להזמין שולחן מראש. חלופה: Forni di Napoli.', place: "Trattoria Pomo D'Oro Budapest", lat: 47.5025, lng: 19.0515 },
      { t: '21:15', icon: '🎰', name: 'קזינו Las Vegas', desc: 'ליד גשר השלשלאות, פתוח 24 שעות. לקחת דרכונים. אופציונלי.', lat: 47.4993, lng: 19.0478 },
    ] },
    { date: '2026-11-27', title: 'בלאק פריידי, ובערב הבזיליקה וסימפלה', items: [
      { t: '08:30', icon: '🥐', name: 'ארוחת בוקר ב-VAJ', desc: 'חלופה: Cinamood.', place: 'VAJ Bakery Budapest' },
      { t: '09:15', icon: '🚕', name: 'Bolt לאאוטלט', desc: 'כ-25 דקות, יותר בפקקים של בלאק פריידי.' },
      { t: '09:45', icon: '🛍️', name: 'אאוטלט פרמייר: בלאק פריידי', desc: 'חלופה בטוחה יותר בעיר: וסטאנד או ואצי.', place: 'Premier Outlet Budapest', lat: 47.4637, lng: 18.8424 },
      { t: '12:30', icon: '🚕', name: 'Bolt חזרה למלון', desc: 'לא יאוחר מ-13:00.' },
      { t: '13:30', icon: '🏨', name: 'במלון: מנוחה והכנות לשבת', desc: '', lat: 47.4987, lng: 19.0567 },
      { t: '15:45', icon: '🕯️', name: 'הדלקת נרות', desc: 'בערך. לבדוק את הזמן המדויק.' },
      { t: '17:30', icon: '🍷', name: 'ארוחת ליל שבת ב-Hanna', desc: 'Kazinczy 29. בהזמנה ותשלום מראש (בערך 50 עד 70 אירו לאדם). לבדוק מתי מסתיימת.', lat: 47.4983, lng: 19.0617 },
      { t: '20:00', icon: '🎄', name: 'שוק הבזיליקה ומופע האורות', desc: 'כ-8 דקות הליכה. יין חם וקיורטוש. לבדוק עד מתי פתוח בשישי.', place: "St. Stephen's Basilica", lat: 47.5009, lng: 19.0539 },
      { t: '21:00', icon: '🎡', name: 'הגלגל הענק', desc: '5 דקות מהבזיליקה. לבדוק שעת סגירה.', place: 'Budapest Eye', lat: 47.4985, lng: 19.0525 },
      { t: '22:00', icon: '🍸', name: 'סימפלה', desc: 'בר ההריסות המפורסם. בשישי יש תור.', place: 'Szimpla Kert Budapest', lat: 47.4970, lng: 19.0634 },
      { t: '23:00', icon: '🍹', name: 'חצר גוז׳דו', desc: 'ברים בחצר, דקה מהמלון. אם התור בסימפלה ארוך, מתחילים כאן.', place: 'Gozsdu Udvar Budapest', lat: 47.4983, lng: 19.0580 },
    ] },
    { date: '2026-11-28', title: 'שבת ברגל, ובלילה Sparty', items: [
      { t: '10:00', icon: '☕', name: 'ארוחת בוקר במלון', desc: 'קמים מאוחר.', lat: 47.4987, lng: 19.0567 },
      { t: '11:00', icon: '🌉', name: 'הליכה לגשר השלשלאות', desc: 'כ-15 דקות ברגל. נוף לגבעת בודה באור יום.', place: 'Széchenyi Chain Bridge', lat: 47.4989, lng: 19.0438 },
      { t: '12:30', icon: '🍽️', name: 'ארוחת שבת ב-Hanna', desc: 'בהזמנה ותשלום מראש.', lat: 47.4983, lng: 19.0617 },
      { t: '14:30', icon: '🛏️', name: 'מנוחה במלון', desc: '', lat: 47.4987, lng: 19.0567 },
      { t: '17:00', icon: '🎄', name: 'שוק וורשמארטי', desc: 'צאת שבת בערך ב-17:00. יין חם וקיורטוש.', place: 'Vörösmarty Square', lat: 47.4968, lng: 19.0505 },
      { t: '19:00', icon: '🥩', name: 'ארוחת ערב ב-Nitavalo', desc: 'מסעדת שף בשרית כשרה, Dob 32. להזמין שולחן.', place: 'Nitavalo Kosher Chef Restaurant Budapest', lat: 47.4983, lng: 19.0628 },
      { t: '21:00', icon: '🚕', name: 'Bolt לסצ׳ני', desc: 'בגד ים, כפכפים ומגבת.' },
      { t: '21:30', icon: '♨️', name: 'Sparty בסצ׳ני', desc: 'לוודא שיש מסיבה בתאריך הזה ולקנות כרטיסים מראש.', place: 'Széchenyi Thermal Bath', lat: 47.5186, lng: 19.0819 },
    ] },
    { date: '2026-11-29', title: 'היום השמשי: סיטי פארק, בודה ולומינה', items: [
      { t: '08:30', icon: '🥞', name: 'בראנץ׳ ב-Blueberry', desc: 'ליד הבזיליקה. חלופות: Cookie Beacon או Café Brunch.', place: 'Blueberry Budapest', lat: 47.5016, lng: 19.0525 },
      { t: '09:45', icon: '🚇', name: 'מטרו M1 לכיכר הגיבורים', desc: 'הקו הצהוב.' },
      { t: '10:15', icon: '🗿', name: 'כיכר הגיבורים', desc: '', place: "Heroes' Square", lat: 47.5149, lng: 19.0778 },
      { t: '10:45', icon: '🏰', name: 'טירת ויידהוניאד', desc: '', place: 'Vajdahunyad Castle', lat: 47.5150, lng: 19.0835 },
      { t: '11:30', icon: '⛸️', name: 'החלקה על הקרח (אופציונלי)', desc: 'למרגלות הטירה. לצאת לבודה עד 12:30.', place: 'City Park Ice Rink Budapest', lat: 47.5155, lng: 19.0820 },
      { t: '13:15', icon: '🏰', name: 'באסטיון הדייגים', desc: 'התצפית הכי יפה בעיר.', place: "Fisherman's Bastion", lat: 47.5022, lng: 19.0348 },
      { t: '13:45', icon: '⛪', name: 'כנסיית מתיאש', desc: 'צמודה לבאסטיון.', place: 'Matthias Church', lat: 47.5019, lng: 19.0341 },
      { t: '14:15', icon: '🥐', name: 'קפה ומאפה על הגבעה', desc: 'אין ארוחת צהריים עד הערב.' },
      { t: '15:00', icon: '🏰', name: 'הארמון המלכותי', desc: 'השקיעה בערך ב-16:00.', place: 'Buda Castle', lat: 47.4962, lng: 19.0396 },
      { t: '16:30', icon: '✨', name: 'לומינה פארק באי מרגיט', desc: 'נפתח ב-16:30.', place: 'Lumina Park Budapest Margaret Island', lat: 47.5262, lng: 19.0478 },
      { t: '19:00', icon: '🍕', name: 'ארוחת ערב ב-Twentysix', desc: 'על קיראי, ליד המלון. חלופות: Circo Pizza או Popolare.', place: 'Twentysix Budapest Király utca', lat: 47.4993, lng: 19.0585 },
      { t: '21:00', icon: '🍸', name: 'High Note (אם נשאר כוח)', desc: 'רופטופ מול כיפת הבזיליקה.', place: 'High Note SkyBar Budapest', lat: 47.5005, lng: 19.0527 },
    ] },
    { date: '2026-11-30', title: 'יום אחרון וטיסה', items: [
      { t: '08:30', icon: '☕', name: 'ארוחת בוקר ליד המלון', desc: '' },
      { t: '09:45', icon: '🧳', name: 'צ׳ק-אאוט והשארת מזוודות בקבלה', desc: 'Barceló Budapest', lat: 47.4987, lng: 19.0567 },
      { t: '10:00', icon: '🛍️', name: 'פאשן סטריט וקפה אחרון', desc: 'סיבוב רגוע ליד המלון.', place: 'Fashion Street Budapest', lat: 47.4980, lng: 19.0530 },
      { t: '11:00', icon: '🚕', name: 'Bolt לשדה', desc: 'להזמין ב-11:00 עד 11:15, כ-35 עד 40 דקות.' },
      { t: '14:20', icon: '✈️', name: 'טיסה הביתה · W6 2327', desc: 'Wizz Air מטרמינל 2B. נחיתה בנתב״ג ב-18:35 שעון ישראל.' },
    ] },
  ],

  checklist: [
    'דרכון בתוקף',
    'ביטוח נסיעות',
    'פורינט מזומן או כרטיס בלי עמלת המרה',
    'להוריד את BudapestGO לתחבורה ציבורית',
    'בגד ים לבתי המרחץ',
    'מתאם חשמל (תקע אירופאי)',
    'להזמין: Hanna לשישי ולשבת (בתשלום מראש)',
    'להזמין: Nitavalo למוצאי שבת 19:00',
    'להזמין: Pomo D\'Oro לחמישי 20:00',
    'כרטיסים ל-Sparty (לוודא שיש ב-28.11)',
    'להזמין: 360 Bar לראשון, אם בוחרים בו',
  ],

  tips: [
    { icon: '🚋', title: 'תחבורה', body: 'חשמלית 2 נוסעת לאורך הדנובה ועוברת ליד כל המראות. כרטיס 72 שעות משתלם.' },
    { icon: '💵', title: 'כסף', body: 'המטבע הוא פורינט (HUF). בטיפ במסעדה משאירים 10 עד 15 אחוז, אלא אם כבר כלול בחשבון.' },
    { icon: '♨️', title: 'מרחצאות', body: 'סצ׳ני הכי מפורסם, גלרט הכי יפה, ורודאש הכי מקומי ועם נוף.' },
    { icon: '🍷', title: 'מה לטעום', body: 'גולאש, לאנגוש, קורטוש קלאץ׳, ויין טוקאי.' },
  ],

  phrases: [
    { he: 'שלום', hu: 'Szia', say: 'סִיָה' },
    { he: 'תודה', hu: 'Köszönöm', say: 'קֶסֶנֶם' },
    { he: 'בבקשה', hu: 'Kérem', say: 'קֵרֶם' },
    { he: 'כן / לא', hu: 'Igen / Nem', say: 'אִיגֶן / נֶם' },
    { he: 'כמה זה עולה?', hu: 'Mennyibe kerül?', say: 'מֶנְיִבֶּה קֶרִיל' },
    { he: 'לחיים!', hu: 'Egészségedre!', say: 'אֶגֵסְשֵׁגֶדְרֶה' },
    { he: 'החשבון בבקשה', hu: 'A számlát kérem', say: 'אָה סַאמְלַאט קֵרֶם' },
  ],
};
