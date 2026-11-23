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
      { t: '22:05', icon: '🛬', name: 'נחיתה בבודפשט', desc: 'שעון מקומי (שעה אחורה מישראל). מונית או Bolt למלון, כ-35 דקות.' },
      { t: '23:00', icon: '🏨', name: 'צ׳ק-אין ב-Barceló', desc: 'Király utca 16', lat: 47.4987, lng: 19.0567 },
      { t: '23:30', icon: '✨', name: 'סיבוב קצר בפאשן סטריט', desc: 'רק אם יש כוח: המדרחוב המואר, שתי דקות מהמלון. השווקים כבר סגורים בשעה הזאת.', place: 'Fashion Street Budapest', lat: 47.4980, lng: 19.0530 },
    ] },
    { date: '2026-11-26', title: 'יום מקורה: קניות, שוק ופרלמנט מואר', items: [
      { t: '09:00', icon: '☕', name: 'ארוחת בוקר ליד המלון', desc: 'Tel Aviv Cafe או קפה תמר (כשרים חלביים), או Cirkusz Café.', place: 'Tel Aviv Cafe Budapest Kazinczy' },
      { t: '10:00', icon: '🕍', name: 'בית הכנסת הגדול', desc: 'ברחוב דוהאני, 5 דקות הליכה. בשבת סגור ובשישי נסגר מוקדם, אז היום.', place: 'Dohány Street Synagogue', lat: 47.4960, lng: 19.0607 },
      { t: '12:00', icon: '🛍️', name: 'קניון ארנה', desc: 'הבחירה הראשונה של פז. ארוחת צהריים בקניון. חלופה: וסטאנד.', place: 'Arena Mall Budapest' },
      { t: '16:00', icon: '🧺', name: 'השוק הגדול', desc: 'מקניון ארנה (Keleti) קו M4 ישר לתחנת Fővám tér. נסגר ב-18:00.', place: 'Central Market Hall Budapest', lat: 47.4870, lng: 19.0585 },
      { t: '18:30', icon: '🏛️', name: 'הפרלמנט המואר ואנדרטת הנעליים', desc: 'הפרלמנט בתאורה של לילה, אנדרטת הנעליים על הדנובה במרחק 5 דקות, וכיכר החירות בדרך חזרה.', place: 'Hungarian Parliament Building', lat: 47.5071, lng: 19.0457 },
      { t: '20:00', icon: '🍝', name: 'ארוחת ערב: Pomo D\'Oro', desc: 'להזמין שולחן מראש. חלופה: Forni di Napoli.', place: "Trattoria Pomo D'Oro Budapest" },
      { t: '21:30', icon: '🎄', name: 'הבזיליקה ומופע האורות', desc: 'שוק הכריסמס והקרנת האורות על החזית. אם רוצים אחר כך: קזינו (לקחת דרכונים).', place: "St. Stephen's Basilica", lat: 47.5009, lng: 19.0539 },
    ] },
    { date: '2026-11-27', title: 'בלאק פריידי וכניסת שבת', items: [
      { t: '08:30', icon: '🥐', name: 'ארוחת בוקר קלה', desc: 'VAJ או Cinamood.', place: 'VAJ Bakery Budapest' },
      { t: '09:30', icon: '🛍️', name: 'אאוטלט פרמייר: בלאק פריידי', desc: 'כ-25 דקות ב-Bolt. אם לא רוצים לצאת מהעיר: וסטאנד. לחזור עד 14:00.', place: 'Premier Outlet Budapest', lat: 47.4637, lng: 18.8424 },
      { t: '14:00', icon: '🏨', name: 'חזרה למלון והכנות לשבת', desc: '', lat: 47.4987, lng: 19.0567 },
      { t: '15:45', icon: '🕯️', name: 'הדלקת נרות', desc: 'בערך. לבדוק את הזמן המדויק לבודפשט.' },
      { t: '17:30', icon: '🍷', name: 'ארוחת ליל שבת ב-Hanna', desc: 'Kazinczy 29. בהזמנה ותשלום מראש (בערך 50 עד 70 אירו לאדם).' },
    ] },
    { date: '2026-11-28', title: 'שבת ברגל, ובלילה Sparty', items: [
      { t: '09:00', icon: '🕍', name: 'בית כנסת קזינצי או רומבך', desc: 'צמודים למלון.', place: 'Kazinczy Street Synagogue', lat: 47.4980, lng: 19.0615 },
      { t: '12:30', icon: '🍽️', name: 'ארוחת שבת ב-Hanna', desc: 'בהזמנה ותשלום מראש.' },
      { t: '14:30', icon: '🚶', name: 'הליכה: אנדראשי, פארק בית העירייה, פאשן סטריט', desc: 'הכל ברגל וקרוב למלון.', place: 'Andrássy Avenue' },
      { t: '17:00', icon: '🎄', name: 'צאת שבת, ושוק וורשמארטי', desc: 'צאת שבת בערך ב-17:00. יין חם וקיורטוש.', place: 'Vörösmarty Square', lat: 47.4968, lng: 19.0505 },
      { t: '19:00', icon: '🥩', name: 'ארוחת ערב ב-Nitavalo', desc: 'מסעדת שף בשרית כשרה, Dob 32. להזמין שולחן.', place: 'Nitavalo Kosher Chef Restaurant Budapest' },
      { t: '21:30', icon: '♨️', name: 'Sparty בסצ׳ני', desc: 'לוודא שיש מסיבה בתאריך הזה ולקנות כרטיסים מראש. בגד ים וכפכפים.', place: 'Széchenyi Thermal Bath', lat: 47.5186, lng: 19.0819 },
    ] },
    { date: '2026-11-29', title: 'היום השמשי: סיטי פארק, בודה ולומינה', items: [
      { t: '09:00', icon: '🥞', name: 'בראנץ׳ באזור הבזיליקה', desc: 'Blueberry, Cookie Beacon או Café Brunch. משם קו M1 לכיכר הגיבורים.', place: 'Blueberry Budapest' },
      { t: '10:00', icon: '🏰', name: 'כיכר הגיבורים וטירת ויידהוניאד', desc: 'החלקה על הקרח אופציונלית, למרגלות הטירה.', place: "Heroes' Square", lat: 47.5149, lng: 19.0778 },
      { t: '12:30', icon: '🔭', name: 'באסטיון הדייגים, כנסיית מתיאש והארמון', desc: 'התצפית הכי יפה בעיר, בשמש של אחר הצהריים.', place: "Fisherman's Bastion", lat: 47.5022, lng: 19.0348 },
      { t: '16:30', icon: '✨', name: 'לומינה פארק באי מרגיט', desc: 'נפתח ב-16:30. קרוב: Brooklyn Bagel (כשר חלבי) ו-Babka Deli.', place: 'Lumina Park Budapest Margaret Island' },
      { t: '19:00', icon: '🍕', name: 'ארוחת ערב', desc: 'Circo Pizza, Popolare או Twentysix.', place: 'Twentysix Budapest Király utca' },
      { t: '21:00', icon: '🍸', name: 'דרינק פרידה', desc: 'High Note או 360 Bar (להזמין), ואחר כך סימפלה וחצר גוז׳דו.', place: 'High Note SkyBar Budapest' },
    ] },
    { date: '2026-11-30', title: 'יום אחרון וטיסה', items: [
      { t: '08:30', icon: '☕', name: 'ארוחת בוקר וסיבוב אחרון', desc: 'הגלגל הענק (3 דקות מהמלון) ופאשן סטריט.', place: 'Budapest Eye', lat: 47.4985, lng: 19.0525 },
      { t: '10:30', icon: '🧳', name: 'צ׳ק-אאוט', desc: 'Barceló Budapest', lat: 47.4987, lng: 19.0567 },
      { t: '11:30', icon: '🚕', name: 'יציאה לשדה', desc: 'מונית או Bolt, כ-35 דקות. כדאי להיות בשדה עד 12:20.' },
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
