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
  googleMapsKey: '',

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
    ] },
    { date: '2026-11-26', title: 'יום חמישי', items: [] },
    { date: '2026-11-27', title: 'יום שישי, כניסת שבת', items: [] },
    { date: '2026-11-28', title: 'שבת', items: [] },
    { date: '2026-11-29', title: 'יום ראשון', items: [] },
    { date: '2026-11-30', title: 'יום אחרון וטיסה', items: [
      { t: '11:30', icon: '🚕', name: 'יציאה לשדה', desc: 'צ׳ק-אאוט מהמלון ונסיעה לשדה (כ-35 דקות). כדאי להיות בשדה עד 12:20.' },
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
    'להזמין כרטיסים לפרלמנט',
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
