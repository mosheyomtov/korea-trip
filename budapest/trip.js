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
    { date: '2026-11-25', title: 'נחיתה', items: [
      { t: '19:30', icon: '✈️', name: 'טיסה לבודפשט · W6 2328', desc: 'Wizz Air מנתב״ג, טרמינל 1. כדאי להגיע לשדה בסביבות 16:30.' },
      { t: '22:05', icon: '🛬', name: 'נחיתה בבודפשט', desc: 'שעון מקומי (שעה אחורה מישראל). ביקורת דרכונים ומזוודות.' },
      { t: '22:45', icon: '🚕', name: 'Bolt למלון', desc: 'כ-35 דקות.' },
      { t: '23:30', icon: '🏨', name: 'צ׳ק-אין ב-Barceló', desc: 'Király utca 16.', lat: 47.4987, lng: 19.0567 },
    ] },
    { date: '2026-11-26', title: 'בזיליקה, בית הכנסת הגדול, גבעת גלרט ושוק כריסמס', items: [
      { t: '09:50', icon: '🏨', name: 'יציאה מהמלון', desc: 'Barceló, Király utca 16.', lat: 47.4987, lng: 19.0567 },
      { t: '10:00', icon: '☕', name: 'ארוחת בוקר ב-Tel Aviv Cafe', desc: 'ליד המלון, עד 10:30. חלופות: קפה תמר או Cirkusz.', place: 'Tel Aviv Cafe Budapest Kazinczy', lat: 47.4980, lng: 19.0618 },
      { t: '10:45', icon: '⛪', name: 'הבזיליקה מבפנים ותצפית 360° מהכיפה', desc: 'עד 11:45. 8 דקות הליכה מהמלון. נכנסים פנימה ועולים במעלית לתצפית על כל העיר.', place: "St. Stephen's Basilica", lat: 47.5009, lng: 19.0539 },
      { t: '12:00', icon: '🕍', name: 'בית הכנסת הגדול', desc: 'עד 13:00. כ-15 דקות הליכה מהבזיליקה. הכרטיס כולל סיור מודרך, המוזיאון היהודי ועץ הערבה הבוכייה. זה היום הכי טוב: בשישי פתוח רק עד הצהריים ובשבת סגור.', place: 'Dohány Street Synagogue', lat: 47.4960, lng: 19.0607 },
      { t: '13:15', icon: '🍕', name: 'אופציה: פיצה ב-Pizza George', desc: 'אם בא לנו פיצה. על הדרך לשוק. לא כשר.', place: 'Pizza George Budapest', lat: 47.4906, lng: 19.0581 },
      { t: '13:30', icon: '🧺', name: 'השוק הגדול המקורה', desc: 'עד 14:30. כ-15 דקות הליכה מבית הכנסת, או 2 תחנות במטרו M4. חם ויבש.', place: 'Central Market Hall Budapest', lat: 47.4870, lng: 19.0585 },
      { t: '14:30', icon: '🌉', name: 'גשר החירות', desc: 'יוצאים מהשוק ישר לגשר הירוק וחוצים לבודה.', place: 'Liberty Bridge Budapest', lat: 47.4859, lng: 19.0556 },
      { t: '14:45', icon: '⛰️', name: 'גבעת גלרט והמצודה', desc: 'עד 16:15, לתפוס את השקיעה מלמעלה. 20 דקות עלייה ברגל, או אוטובוס 27 או Bolt. פארק חדש, פסל החירות ומרפסות תצפית חינם. בגשם: התערוכה Bastion of Liberty ובית קפה בפנים.', place: 'Citadella Budapest', lat: 47.4868, lng: 19.0470 },
      { t: '16:15', icon: '🥐', name: 'שדרת Bartók Béla', desc: 'עד 17:00. יורדים לכיכר Szent Gellért. קפה ומאפה חם ברחוב מקומי ויפה.', place: 'Bartók Béla út Budapest', lat: 47.4800, lng: 19.0530 },
      { t: '17:00', icon: '🚕', name: 'Bolt לבזיליקה', desc: 'כ-10 דקות.' },
      { t: '17:15', icon: '🎄', name: 'שוק הכריסמס של הבזיליקה', desc: 'השוק הכי יפה בעיר, עם מופע האורות על חזית הכנסייה כל חצי שעה. היום אפשר לקנות ולטעום (בשישי בערב כבר שבת). קיורטוש ויין חם. 5 דקות הליכה למסעדה.', place: "St. Stephen's Basilica", lat: 47.5009, lng: 19.0539 },
      { t: '18:30', icon: '🍝', name: 'ארוחת ערב ב-Pomo D\'Oro', desc: 'אם יש שולחן. חלופות: Forni di Napoli ליד הבזיליקה, או איטלקי ליד המלון.', place: "Trattoria Pomo D'Oro Budapest", lat: 47.5025, lng: 19.0515 },
      { t: '20:30', icon: '🍻', name: 'סימפלה', desc: 'בר ההריסות המפורסם.', place: 'Szimpla Kert Budapest', lat: 47.4970, lng: 19.0634 },
      { t: '21:30', icon: '🍸', name: 'חצר גוז׳דו', desc: 'ברים או בר קוקטיילים.', place: 'Gozsdu Udvar Budapest', lat: 47.4983, lng: 19.0580 },
      { t: '23:00', icon: '🏨', name: 'חזרה למלון', desc: 'כ-5 דקות הליכה מגוז׳דו.', lat: 47.4987, lng: 19.0567 },
    ] },
    { date: '2026-11-27', title: 'בלאק פריידי וליל שבת', items: [
      { t: '09:15', icon: '🏨', name: 'יציאה מהמלון', desc: 'Barceló, Király utca 16.', lat: 47.4987, lng: 19.0567 },
      { t: '09:30', icon: '🥐', name: 'ארוחת בוקר ב-VAJ', desc: 'חלופה: Cinamood.', place: 'VAJ Bakery Budapest' },
      { t: '10:30', icon: '🛍️', name: 'בלאק פריידי בוסטאנד', desc: 'מקורה, ליד Nyugati.', place: 'Westend Budapest', lat: 47.5130, lng: 19.0590 },
      { t: '12:45', icon: '👗', name: 'ואצי אוצה', desc: 'ו/או במקום וסטאנד. עד 14:15.', place: 'Váci Street Budapest', lat: 47.4935, lng: 19.0525 },
      { t: '13:45', icon: '✨', name: 'פאשן סטריט', desc: 'בדרך חזרה למלון.', place: 'Fashion Street Budapest', lat: 47.4980, lng: 19.0530 },
      { t: '14:30', icon: '🏨', name: 'התארגנות לשבת במלון', desc: '', lat: 47.4987, lng: 19.0567 },
      { t: '15:45', icon: '🕯️', name: 'הדלקת נרות', desc: 'בערך. לבדוק את הזמן המדויק.' },
      { t: '17:30', icon: '🍷', name: 'ארוחת ליל שבת ב-Hanna', dk: 'Hanna', desc: 'Kazinczy 29. להזמין ולשלם מראש.', lat: 47.4983, lng: 19.0617 },
      { t: '20:00', icon: '🎄', name: 'שוק הבזיליקה ומופע האורות', desc: 'לבדוק עד מתי פתוח בשישי.', place: "St. Stephen's Basilica", lat: 47.5009, lng: 19.0539 },
      { t: '21:00', icon: '🎡', name: 'הגלגל הענק', desc: 'לבדוק שעת סגירה.', place: 'Budapest Eye', lat: 47.4985, lng: 19.0525 },
      { t: '21:45', icon: '🍸', name: 'חצר גוז׳דו', desc: 'דרינק, רק אם זורם לפז.', place: 'Gozsdu Udvar Budapest', lat: 47.4983, lng: 19.0580 },
      { t: '22:30', icon: '🏨', name: 'חזרה למלון', desc: 'כ-5 דקות הליכה מגוז׳דו.', lat: 47.4987, lng: 19.0567 },
    ] },
    { date: '2026-11-28', title: 'שבת ברגל, ובלילה מרחצאות', items: [
      { t: '10:00', icon: '☕', name: 'ארוחת בוקר במלון', desc: '', lat: 47.4987, lng: 19.0567 },
      { t: '11:00', icon: '🌉', name: 'גשר השלשלאות', desc: 'הליכה קצרה, וחזרה ב-12:05.', place: 'Széchenyi Chain Bridge', lat: 47.4989, lng: 19.0438 },
      { t: '12:30', icon: '🍽️', name: 'ארוחת שבת ב-Hanna', dk: 'Hanna', desc: 'בהזמנה ותשלום מראש.', lat: 47.4983, lng: 19.0617 },
      { t: '14:45', icon: '🚶', name: 'הליכה לאורך שדרת אנדראשי', desc: 'כ-35 דקות עד כיכר הגיבורים.' },
      { t: '15:20', icon: '🗿', name: 'כיכר הגיבורים', desc: '', place: "Heroes' Square", lat: 47.5149, lng: 19.0778 },
      { t: '15:45', icon: '🏰', name: 'טירת ויידהוניאד', desc: '', place: 'Vajdahunyad Castle', lat: 47.5150, lng: 19.0835 },
      { t: '16:45', icon: '🎢', name: 'אופציה: Happy Wonderland וההחלקה על הקרח', desc: 'צמוד לטירה. מסתובבים בפארק המואר (כניסה חינם), ואחרי צאת שבת מתקנים או החלקה, לפי מצב הרוח. שעות משתנות: happywonderland.hu.', place: 'Happy Wonderland Budapest', lat: 47.5157, lng: 19.0812 },
      { t: '18:00', icon: '🚇', name: 'מטרו M1 לוורשמארטי', desc: 'כ-10 דקות, מכיכר הגיבורים.' },
      { t: '18:15', icon: '🎄', name: 'שוק וורשמארטי', desc: 'יין חם וקיורטוש. משם כ-15 דקות הליכה ל-Nitavalo.', place: 'Vörösmarty Square', lat: 47.4968, lng: 19.0505 },
      { t: '19:00', icon: '🥩', name: 'ארוחת ערב ב-Nitavalo', desc: 'להזמין שולחן.', place: 'Nitavalo Kosher Chef Restaurant Budapest', lat: 47.4983, lng: 19.0628 },
      { t: '21:15', icon: '🚕', name: 'Bolt לסצ׳ני', desc: 'בגד ים, כפכפים ומגבת.' },
      { t: '21:30', icon: '♨️', name: 'Sparty בסצ׳ני', desc: 'אם קר מדי: מרחצאות רודאש, עם רחצה לילית מקורה.', place: 'Széchenyi Thermal Bath', lat: 47.5186, lng: 19.0819 },
      { t: '00:30', icon: '🏨', name: 'חזרה למלון', desc: 'Bolt מסצ׳ני, כ-10 דקות.', lat: 47.4987, lng: 19.0567 },
    ] },
    { date: '2026-11-29', title: 'יום השמש ופרלמנט מואר', items: [
      { t: '09:45', icon: '🏨', name: 'יציאה מהמלון', desc: 'Barceló, Király utca 16.', lat: 47.4987, lng: 19.0567 },
      { t: '10:00', icon: '🥞', name: 'בראנץ׳ ב-Blueberry', desc: 'חלופות: Cookie Beacon או Café Brunch.', place: 'Blueberry Budapest', lat: 47.5016, lng: 19.0525 },
      { t: '12:30', icon: '🚕', name: 'Bolt או אוטובוס 16 לבודה', desc: '' },
      { t: '13:00', icon: '🏰', name: 'באסטיון הדייגים', desc: '', place: "Fisherman's Bastion", lat: 47.5022, lng: 19.0348 },
      { t: '13:40', icon: '⛪', name: 'כנסיית מתיאש', desc: 'הצצה.', place: 'Matthias Church', lat: 47.5019, lng: 19.0341 },
      { t: '14:15', icon: '☕', name: 'קפה על הגבעה', desc: '' },
      { t: '15:00', icon: '🏰', name: 'חצר ארמון בודה', desc: '', place: 'Buda Castle', lat: 47.4962, lng: 19.0396 },
      { t: '16:00', icon: '🚕', name: 'Bolt ללומינה פארק', desc: '' },
      { t: '16:30', icon: '💡', name: 'לומינה פארק באי מרגיט', desc: 'עד 17:45.', place: 'Lumina Park Budapest Margaret Island', lat: 47.5262, lng: 19.0478 },
      { t: '18:00', icon: '🚕', name: 'Bolt לפרלמנט', desc: 'כ-7 דקות.' },
      { t: '18:10', icon: '🏛️', name: 'הפרלמנט המואר', desc: '', place: 'Hungarian Parliament Building', lat: 47.5071, lng: 19.0457 },
      { t: '18:35', icon: '👞', name: 'אנדרטת הנעליים', desc: 'על הדרך למלון.', place: 'Shoes on the Danube Bank', lat: 47.5045, lng: 19.0448 },
      { t: '19:00', icon: '🍕', name: 'ארוחת ערב ב-Twentysix', desc: 'חלופות: Circo או Popolare.', place: 'Twentysix Budapest Király utca', lat: 47.4993, lng: 19.0585 },
      { t: '21:00', icon: '🌃', name: 'סגירת טיול: High Note', desc: 'או 360 Bar, או קזינו (דרכונים).', place: 'High Note SkyBar Budapest', lat: 47.5005, lng: 19.0527 },
      { t: '23:00', icon: '🏨', name: 'חזרה למלון', desc: 'כ-5 דקות הליכה מ-High Note.', lat: 47.4987, lng: 19.0567 },
    ] },
    { date: '2026-11-30', title: 'טיסה', items: [
      { t: '09:00', icon: '☕', name: 'ארוחת בוקר', desc: '' },
      { t: '09:40', icon: '🧳', name: 'צ׳ק-אאוט', desc: 'משאירים מזוודות בקבלה.', lat: 47.4987, lng: 19.0567 },
      { t: '10:00', icon: '✨', name: 'פאשן סטריט', desc: '3 דקות מהמלון.', place: 'Fashion Street Budapest', lat: 47.4980, lng: 19.0530 },
      { t: '10:30', icon: '🎪', name: 'פארק בית העירייה וקפה אחרון', desc: '', place: 'Városháza Park', lat: 47.4975, lng: 19.0545 },
      { t: '11:00', icon: '🚕', name: 'Bolt לשדה', desc: 'להזמין ב-11:00 עד 11:15.' },
      { t: '14:20', icon: '✈️', name: 'טיסה הביתה · W6 2327', desc: 'Wizz Air מטרמינל 2B. נחיתה בנתב״ג ב-18:35 שעון ישראל.' },
    ] },
  ],

  checklist: [
    'דרכון בתוקף',
    'ביטוח נסיעות',
    'פורינט מזומן או כרטיס בלי עמלת המרה',
    'להוריד את BudapestGO לתחבורה ציבורית',
    'בגד ים, כפכפים ומגבת למרחצאות',
    'מתאם חשמל (תקע אירופאי)',
    'להזמין ולשלם: Hanna לשישי ולשבת, ולברר את שעות הסבבים',
    'להזמין: Nitavalo למוצאי שבת',
    'להזמין: Pomo D\'Oro לחמישי',
    'כרטיסים ל-Sparty (או לבדוק שעות רחצה לילית ברודאש)',
    'כרטיסים ללומינה פארק',
    'לבדוק שעות סגירה בשישי בלילה: שוק הבזיליקה והגלגל הענק',
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
