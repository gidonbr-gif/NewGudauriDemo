/* ═══════════════════════════════════════════════════════════════
   Gudauri Helper — site chat assistant
   Self-contained widget: answers common questions from the site's
   own content (apartments, equipment, resort, investing, travel).
   When it has no answer it hands the question off to WhatsApp.
   4 languages (he/en/ru/ge), follows the site language switcher.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var WA_NUMBER = '972557790955';

  /* ─── UI strings ─── */
  var UI = {
    he: {
      dir: 'rtl',
      launcher: 'צ׳אט — שאלו אותנו הכל',
      title: 'Gudauri Helper',
      subtitle: 'עוזר אישי · מענה מיידי',
      greeting: 'היי! 👋 אני העוזר של Gudauri Helper.\nשאלו אותי על דירות, ציוד סקי, הגעה לגודאורי, השקעות — או כל דבר אחר.',
      placeholder: 'כתבו שאלה...',
      send: 'שליחה',
      close: 'סגירת צ׳אט',
      fallback: 'שאלה מצוינת — אין לי תשובה מוכנה עליה. שלחו אותה ישירות לגדעון בוואטסאפ ותקבלו מענה אישי:',
      waBtn: 'שליחה לגדעון בוואטסאפ',
      chips: ['🏠 דירות ומחירים', '🎿 השכרת ציוד', '🚐 איך מגיעים?', '📈 השקעות נדל״ן']
    },
    en: {
      dir: 'ltr',
      launcher: 'Chat — ask us anything',
      title: 'Gudauri Helper',
      subtitle: 'Personal assistant · instant answers',
      greeting: 'Hi! 👋 I\'m the Gudauri Helper assistant.\nAsk me about apartments, ski equipment, getting to Gudauri, investing — or anything else.',
      placeholder: 'Type a question...',
      send: 'Send',
      close: 'Close chat',
      fallback: 'Great question — I don\'t have a ready answer for it. Send it straight to Gidon on WhatsApp for a personal reply:',
      waBtn: 'Send to Gidon on WhatsApp',
      chips: ['🏠 Apartments & prices', '🎿 Equipment rental', '🚐 How to get there?', '📈 Property investing']
    },
    ru: {
      dir: 'ltr',
      launcher: 'Чат — спросите нас',
      title: 'Gudauri Helper',
      subtitle: 'Личный помощник · мгновенные ответы',
      greeting: 'Привет! 👋 Я помощник Gudauri Helper.\nСпросите про апартаменты, прокат снаряжения, дорогу в Гудаури, инвестиции — что угодно.',
      placeholder: 'Напишите вопрос...',
      send: 'Отправить',
      close: 'Закрыть чат',
      fallback: 'Отличный вопрос — готового ответа у меня нет. Отправьте его Гидону в WhatsApp и получите личный ответ:',
      waBtn: 'Отправить Гидону в WhatsApp',
      chips: ['🏠 Апартаменты и цены', '🎿 Прокат снаряжения', '🚐 Как добраться?', '📈 Инвестиции']
    },
    ge: {
      dir: 'ltr',
      launcher: 'ჩატი — გვკითხეთ ყველაფერი',
      title: 'Gudauri Helper',
      subtitle: 'პირადი ასისტენტი · მყისიერი პასუხები',
      greeting: 'გამარჯობა! 👋 მე Gudauri Helper-ის ასისტენტი ვარ.\nმკითხეთ აპარტამენტებზე, აღჭურვილობაზე, გუდაურამდე მგზავრობაზე, ინვესტიციებზე — ან ნებისმიერ რამეზე.',
      placeholder: 'დაწერეთ კითხვა...',
      send: 'გაგზავნა',
      close: 'ჩატის დახურვა',
      fallback: 'კარგი კითხვაა — მზა პასუხი არ მაქვს. გაუგზავნეთ პირდაპირ გიდონს WhatsApp-ში:',
      waBtn: 'გაგზავნა WhatsApp-ში',
      chips: ['🏠 აპარტამენტები და ფასები', '🎿 აღჭურვილობის ქირაობა', '🚐 როგორ ჩავიდე?', '📈 ინვესტიციები']
    }
  };

  /* ─── Knowledge base — built from the site's pages ─── */
  var KB = [
    {
      id: 'apartments',
      kw: ['דירה', 'דירות', 'לינה', 'מלון', 'חדר', 'לילה', 'ללילה', 'מחיר ללילה', 'apartment', 'apartments', 'accommodation', 'room', 'stay', 'hotel', 'sleep', 'night', 'апартамент', 'квартир', 'жиль', 'отел', 'ночь', 'проживан', 'აპარტამენტ', 'ბინა', 'განთავსება', 'სასტუმრო', 'ღამეში'],
      ans: {
        he: 'יש לנו שש דירות פרמיום בניו גודאורי, כולן 50–100 מ׳ מהגונדולה: F2 Duplex (130 מ״ר, 4 חדרי שינה + סאונה), Atrium (סטודיו עם בריכה וספא בבניין), Suits, שני לופטים ו-Suite Block 5. מחירים החל מ-₪370 ללילה, הזמנה ישירה בלי עמלות פלטפורמה וביטול חינם עד 48 שעות לפני הגעה.',
        en: 'We offer six premium apartments in New Gudauri, all 50–100 m from the gondola: F2 Duplex (130 m², 4 bedrooms + sauna), Atrium (studio with pool & spa in the building), Suits, two lofts and Suite Block 5. Prices from ₪370/night, direct booking with no platform fees and free cancellation up to 48 hours before arrival.',
        ru: 'У нас шесть премиальных апартаментов в Новом Гудаури, все в 50–100 м от гондолы: F2 Duplex (130 м², 4 спальни + сауна), Atrium (студия с бассейном и спа в здании), Suits, два лофта и Suite Block 5. Цены от ₪370/ночь, прямое бронирование без комиссий и бесплатная отмена за 48 часов до заезда.',
        ge: 'გვაქვს ექვსი პრემიუმ აპარტამენტი ახალ გუდაურში, ყველა გონდოლიდან 50–100 მეტრში: F2 Duplex (130 მ², 4 საძინებელი + საუნა), Atrium (სტუდიო აუზითა და სპათი შენობაში), Suits, ორი ლოფტი და Suite Block 5. ფასები ₪370-დან ღამეში, პირდაპირი ჯავშანი საკომისიოს გარეშე, უფასო გაუქმება ჩამოსვლამდე 48 საათით ადრე.'
      },
      links: [{ t: { he: 'לכל הדירות ←', en: 'View all apartments →', ru: 'Все апартаменты →', ge: 'ყველა აპარტამენტი →' }, href: 'lina.html#apartments' }]
    },
    {
      id: 'pool-spa',
      kw: ['בריכה', 'ספא', 'סאונה', 'גקוזי', "ג'קוזי", 'pool', 'spa', 'sauna', 'jacuzzi', 'бассейн', 'спа', 'саун', 'джакузи', 'აუზი', 'სპა', 'საუნა'],
      ans: {
        he: 'בבניין Atrium יש בריכה מקורה מחוממת, ג׳קוזי, ספא וסאונה (נפתחים עם פתיחת העונה בדצמבר; ג׳קוזי ובריכה בתשלום נוסף). בדופלקס F2 יש סאונה פרטית + אינפרא אדום בתוך הדירה.',
        en: 'The Atrium building has a heated indoor pool, jacuzzi, spa and sauna (open from the season start in December; pool and jacuzzi carry an extra charge). The F2 Duplex has its own private sauna + infrared inside the apartment.',
        ru: 'В здании Atrium — крытый подогреваемый бассейн, джакузи, спа и сауна (работают с открытия сезона в декабре; бассейн и джакузи за доплату). В дуплексе F2 — собственная сауна + инфракрасная кабина прямо в апартаментах.',
        ge: 'Atrium-ის შენობაში არის გათბობადი დახურული აუზი, ჯაკუზი, სპა და საუნა (იხსნება სეზონთან ერთად დეკემბერში; აუზი და ჯაკუზი დამატებით ფასიანია). F2 Duplex-ს აქვს საკუთარი საუნა + ინფრაწითელი კაბინა აპარტამენტშივე.'
      },
      links: [{ t: { he: 'לדירות ←', en: 'See the apartments →', ru: 'К апартаментам →', ge: 'აპარტამენტები →' }, href: 'lina.html#apartments' }]
    },
    {
      id: 'booking',
      kw: ['הזמנה', 'להזמין', 'תשלום', 'ביטול', 'מקדמה', 'כרטיס אשראי', 'book', 'booking', 'reserve', 'payment', 'pay', 'cancel', 'cancellation', 'deposit', 'credit card', 'брониров', 'оплат', 'отмен', 'депозит', 'карт', 'ჯავშ', 'გადახდა', 'გაუქმება'],
      ans: {
        he: 'ההזמנה ישירה ומאובטחת — בלי עמלות פלטפורמה. משלמים אונליין בסליקה מאובטחת (Cardcom) או מתאמים בוואטסאפ. ביטול חינם עד 48 שעות לפני ההגעה. בהשכרת ציוד משלמים מקדמה של 10% בלבד והיתרה בחנות.',
        en: 'Booking is direct and secure — no platform fees. Pay online via secure checkout (Cardcom) or arrange everything on WhatsApp. Free cancellation up to 48 hours before arrival. For equipment rental you pay only a 10% deposit, the rest at the shop.',
        ru: 'Бронирование прямое и безопасное — без комиссий платформ. Оплата онлайн через защищённый шлюз (Cardcom) или через WhatsApp. Бесплатная отмена за 48 часов до заезда. За прокат снаряжения — только 10% депозит, остальное в магазине.',
        ge: 'ჯავშანი პირდაპირი და უსაფრთხოა — პლატფორმის საკომისიოს გარეშე. გადახდა ონლაინ დაცული სისტემით (Cardcom) ან WhatsApp-ით. უფასო გაუქმება ჩამოსვლამდე 48 საათით ადრე. აღჭურვილობაზე იხდით მხოლოდ 10% ავანსს, დანარჩენს — მაღაზიაში.'
      },
      links: [{ t: { he: 'להזמנת דירה ←', en: 'Book an apartment →', ru: 'Забронировать →', ge: 'დაჯავშნა →' }, href: 'lina.html#apartments' }]
    },
    {
      id: 'equipment',
      kw: ['ציוד', 'השכרת', 'סקי', 'מגלשיים', 'סנובורד', 'קסדה', 'גוגלס', 'מעיל', 'הנחה', 'equipment', 'rental', 'rent', 'ski', 'skis', 'snowboard', 'helmet', 'goggles', 'jacket', 'gear', 'discount', 'прокат', 'снаряжен', 'лыж', 'сноуборд', 'шлем', 'маск', 'куртк', 'скидк', 'აღჭურვილობ', 'თხილამურ', 'სნოუბორდ', 'ჩაფხუტ'],
      ans: {
        he: 'משכירים דרך שתי חנויות מקצועיות בניו גודאורי — Ski Boom ו-Fanatic. מחירים ליום: סקי $25–50 לפי רמה, סנובורד $28–55, קסדה $12, ביגוד תרמי $20, גוגלס $5. מזמינים מראש לפי מידות ומקבלים עד 20% הנחה על חבילה מלאה — הציוד מחכה לכם מוכן.',
        en: 'We rent through two professional shops in New Gudauri — Ski Boom and Fanatic. Daily prices: skis $25–50 by level, snowboard $28–55, helmet $12, thermal clothing $20, goggles $5. Pre-order with your sizes and get up to 20% off the full package — your gear is ready when you arrive.',
        ru: 'Прокат через два профессиональных магазина в Новом Гудаури — Ski Boom и Fanatic. Цены в день: лыжи $25–50 по уровню, сноуборд $28–55, шлем $12, термоодежда $20, маска $5. Закажите заранее по размерам и получите до 20% скидки на полный комплект — снаряжение будет ждать вас готовым.',
        ge: 'ვაქირავებთ ორი პროფესიონალური მაღაზიით ახალ გუდაურში — Ski Boom და Fanatic. ფასები დღეში: თხილამურები $25–50 დონის მიხედვით, სნოუბორდი $28–55, ჩაფხუტი $12, თერმო ტანსაცმელი $20, სათვალე $5. შეუკვეთეთ წინასწარ ზომებით და მიიღეთ 20%-მდე ფასდაკლება სრულ პაკეტზე.'
      },
      links: [{ t: { he: 'להזמנת ציוד מראש ←', en: 'Pre-order equipment →', ru: 'Заказать снаряжение →', ge: 'აღჭურვილობის შეკვეთა →' }, href: 'equipment.html#preorder' }]
    },
    {
      id: 'resort',
      kw: ['מסלול', 'מסלולים', 'רכבל', 'גובה', 'שלג', 'אתר סקי', 'piste', 'pistes', 'slopes', 'lifts', 'altitude', 'snow', 'resort', 'trails', 'трасс', 'подъемник', 'высот', 'снег', 'курорт', 'ტრას', 'საბაგირო', 'თოვლ', 'კურორტ'],
      ans: {
        he: 'גודאורי הוא אתר הסקי הגדול בגאורגיה: 75+ ק״מ מסלולים, גובה מקסימלי 3,276 מ׳, 15 מתקני רכבל מודרניים (אוסטריים) ו-300 ימי שמש בשנה. מתאים לכל הרמות — ממתחילים ועד פרירייד והליסקי.',
        en: 'Gudauri is Georgia\'s largest ski resort: 75+ km of pistes, 3,276 m max altitude, 15 modern Austrian-built lifts and 300 sunny days a year. It suits every level — from beginners to freeride and heliski.',
        ru: 'Гудаури — крупнейший горнолыжный курорт Грузии: 75+ км трасс, максимальная высота 3 276 м, 15 современных австрийских подъёмников и 300 солнечных дней в году. Подходит всем — от новичков до фрирайда и хелиски.',
        ge: 'გუდაური საქართველოს უდიდესი სათხილამურო კურორტია: 75+ კმ ტრასა, მაქსიმალური სიმაღლე 3 276 მ, 15 თანამედროვე ავსტრიული საბაგირო და წელიწადში 300 მზიანი დღე. შეეფერება ყველა დონეს.'
      },
      links: [{ t: { he: 'עוד על גודאורי ←', en: 'More about Gudauri →', ru: 'Подробнее о Гудаури →', ge: 'მეტი გუდაურზე →' }, href: 'index.html#why' }]
    },
    {
      id: 'season',
      kw: ['עונה', 'עונת', 'מתי', 'דצמבר', 'ינואר', 'פברואר', 'מרץ', 'מזג אוויר', 'season', 'when', 'december', 'january', 'february', 'march', 'april', 'weather', 'open', 'сезон', 'когда', 'декабр', 'январ', 'феврал', 'март', 'погод', 'სეზონ', 'როდის', 'ამინდ'],
      ans: {
        he: 'עונת הסקי בגודאורי נמשכת בערך מדצמבר עד אפריל — אחת העונות הארוכות באזור בזכות הגובה (3,200+ מ׳). עם 300 ימי שמש בשנה, רוב הסיכויים שתתפסו גם שלג מעולה וגם שמיים כחולים.',
        en: 'The ski season in Gudauri runs roughly December to April — one of the longest in the region thanks to the altitude (3,200+ m). With 300 sunny days a year, you\'re likely to get great snow and blue skies at the same time.',
        ru: 'Сезон катания в Гудаури длится примерно с декабря по апрель — один из самых длинных в регионе благодаря высоте (3 200+ м). При 300 солнечных днях в году у вас все шансы застать и отличный снег, и голубое небо.',
        ge: 'სათხილამურო სეზონი გუდაურში გრძელდება დაახლოებით დეკემბრიდან აპრილამდე — ერთ-ერთი ყველაზე ხანგრძლივი რეგიონში სიმაღლის წყალობით (3 200+ მ). წელიწადში 300 მზიანი დღით, დიდი შანსია ერთდროულად შეხვდეთ კარგ თოვლსაც და ლურჯ ცასაც.'
      },
      links: []
    },
    {
      id: 'transfer',
      kw: ['להגיע', 'מגיעים', 'הגעה', 'טיסה', 'טיסות', 'העברה', 'הסעה', 'שדה תעופה', 'טביליסי', 'נסיעה', 'get there', 'getting', 'transfer', 'flight', 'flights', 'airport', 'tbilisi', 'drive', 'distance', 'добраться', 'трансфер', 'рейс', 'аэропорт', 'тбилиси', 'дорог', 'мгзавроб', 'ტრანსფერ', 'აეროპორტ', 'თბილის', 'ფრენ'],
      ans: {
        he: 'טסים לטביליסי, ומשם כשעתיים נסיעה לגודאורי. אנחנו מסדרים הכל: הזמנת כרטיסי טיסה, העברות מטביליסי ישירות לדירה, וליווי דובר עברית לאורך כל הדרך. שלחו תאריכים בוואטסאפ ונבנה לכם מסלול.',
        en: 'Fly to Tbilisi, then it\'s about a two-hour drive to Gudauri. We arrange everything: flight booking, transfers from Tbilisi straight to your apartment, and personal accompaniment throughout. Send us your dates on WhatsApp and we\'ll build your itinerary.',
        ru: 'Прилетаете в Тбилиси, оттуда около двух часов на машине до Гудаури. Мы организуем всё: билеты, трансфер из Тбилиси прямо к апартаментам и личное сопровождение. Отправьте даты в WhatsApp — соберём маршрут.',
        ge: 'ჩამოფრინდით თბილისში, იქიდან გუდაურამდე დაახლოებით ორი საათია მანქანით. ჩვენ ვაწყობთ ყველაფერს: ფრენების დაჯავშნას, ტრანსფერს თბილისიდან პირდაპირ აპარტამენტამდე და პირად თანხლებას. მოგვწერეთ თარიღები WhatsApp-ში.'
      },
      links: [{ t: { he: 'תיאום בוואטסאפ ←', en: 'Plan on WhatsApp →', ru: 'Обсудить в WhatsApp →', ge: 'WhatsApp-ში დაგეგმვა →' }, href: 'https://wa.me/' + WA_NUMBER, ext: true }]
    },
    {
      id: 'newgudauri',
      kw: ['ניו גודאורי', 'גונדולה', 'קזינו', 'מסעדה', 'מסעדות', 'כפר', 'חיי לילה', 'אפרה', 'new gudauri', 'gondola', 'casino', 'restaurant', 'restaurants', 'village', 'nightlife', 'apres', 'новый гудаури', 'гондол', 'казино', 'ресторан', 'ночная жизнь', 'ახალი გუდაური', 'გონდოლ', 'კაზინო', 'რესტორან'],
      ans: {
        he: 'ניו גודאורי הוא הלב הפועם של האתר — כפר מודרני סביב הגונדולה הראשית, עם קזינו, מסעדות, ברים ואפרה-סקי, בריכות וחנויות ציוד מקצועיות. כל הדירות שלנו נמצאות שם, במרחק הליכה מהכל.',
        en: 'New Gudauri is the beating heart of the resort — a modern village around the main gondola, with a casino, restaurants, bars and après-ski, pools and professional gear shops. All our apartments are located there, walking distance from everything.',
        ru: 'Новый Гудаури — сердце курорта: современный посёлок вокруг главной гондолы, с казино, ресторанами, барами и апре-ски, бассейнами и профессиональными магазинами снаряжения. Все наши апартаменты находятся именно там, в шаговой доступности от всего.',
        ge: 'ახალი გუდაური კურორტის გულია — თანამედროვე დასახლება მთავარი გონდოლის გარშემო, კაზინოთი, რესტორნებით, ბარებით, აუზებითა და პროფესიონალური მაღაზიებით. ჩვენი ყველა აპარტამენტი იქ მდებარეობს, ყველაფრიდან ფეხით სავალ მანძილზე.'
      },
      links: [{ t: { he: 'המדריך המלא לניו גודאורי ←', en: 'Full New Gudauri guide →', ru: 'Полный гид по Новому Гудаури →', ge: 'სრული გზამკვლევი →' }, href: 'new-gudauri-info.html' }]
    },
    {
      id: 'invest',
      kw: ['השקעה', 'השקעות', 'להשקיע', 'השקיע', 'משקיע', 'נדלן', 'נדל״ן', 'לקנות דירה', 'רכישה', 'נכס', 'invest', 'investment', 'investor', 'property', 'real estate', 'buy apartment', 'purchase', 'инвест', 'недвижимост', 'купить', 'покупк', 'объект', 'ინვესტ', 'უძრავი ქონება', 'ყიდვა'],
      ans: {
        he: 'גדעון בריטבסקי מלווה משקיעים ישראלים ב-New Gudauri — 4+ שנות ניסיון ו-20+ עסקאות מלוות: איתור נכס, בדיקה משפטית, רכישה (גם מרחוק בייפוי כוח), רישום בטאבו הגאורגי תוך יום-יומיים, וניהול שוטף של הנכס. שיחת ייעוץ ראשונית — חינם.',
        en: 'Gidon Britvsky guides investors in New Gudauri — 4+ years of experience and 20+ completed deals: property sourcing, legal checks, purchase (remotely with power of attorney if needed), registration in the Georgian land registry within 1–2 days, and ongoing property management. The initial consultation is free.',
        ru: 'Гидон Бритвски сопровождает инвесторов в Новом Гудаури — 4+ года опыта и 20+ сделок: подбор объекта, юридическая проверка, покупка (можно удалённо по доверенности), регистрация в грузинском реестре за 1–2 дня и последующее управление недвижимостью. Первая консультация — бесплатно.',
        ge: 'გიდონ ბრიტვსკი ეხმარება ინვესტორებს ახალ გუდაურში — 4+ წლიანი გამოცდილება და 20+ დასრულებული გარიგება: ქონების მოძიება, იურიდიული შემოწმება, შესყიდვა (დისტანციურადაც), რეგისტრაცია 1–2 დღეში და ქონების შემდგომი მართვა. პირველი კონსულტაცია უფასოა.'
      },
      links: [{ t: { he: 'לעמוד המשקיעים ←', en: 'Investors page →', ru: 'Страница инвесторов →', ge: 'ინვესტორების გვერდი →' }, href: 'investors.html' }]
    },
    {
      id: 'invest-legal',
      kw: ['ישראלי יכול', 'חוקי', 'מותר לקנות', 'זרים', 'ייפוי כוח', 'מרחוק', 'טאבו', 'רישום', 'foreigner', 'legal', 'allowed', 'remote', 'power of attorney', 'registry', 'ownership', 'иностран', 'легальн', 'удаленно', 'доверенност', 'реестр', 'უცხოელ', 'ლეგალურ', 'დისტანციურ'],
      ans: {
        he: 'כן — ישראלים (וזרים בכלל) רשאים לרכוש נדל״ן בגאורגיה ללא הגבלות, בלי תושבות ובלי ויזה מיוחדת. הנכס נרשם על שמכם באופן מלא. אפשר לבצע את כל התהליך מרחוק עם ייפוי כוח מנוטריון, והרישום בטאבו הגאורגי (Napr) לוקח יום-יומיים בלבד.',
        en: 'Yes — Israelis (and foreigners in general) can purchase real estate in Georgia without restrictions, no residency or special visa needed. The property is fully registered in your name. The whole process can be done remotely with a notarized power of attorney, and registration in the Georgian registry (Napr) takes just 1–2 days.',
        ru: 'Да — израильтяне (и иностранцы в целом) могут покупать недвижимость в Грузии без ограничений, без ВНЖ и специальных виз. Объект полностью регистрируется на ваше имя. Весь процесс можно провести удалённо по нотариальной доверенности, а регистрация в реестре (Napr) занимает 1–2 дня.',
        ge: 'დიახ — უცხოელებს შეუძლიათ საქართველოში უძრავი ქონების შეძენა შეზღუდვების გარეშე. ქონება სრულად თქვენს სახელზე რეგისტრირდება. მთელი პროცესი შესაძლებელია დისტანციურად, ნოტარიული მინდობილობით, ხოლო რეგისტრაცია (Napr) 1–2 დღეში სრულდება.'
      },
      links: [{ t: { he: 'שאלות נפוצות למשקיעים ←', en: 'Investor FAQ →', ru: 'FAQ для инвесторов →', ge: 'ინვესტორის FAQ →' }, href: 'investors.html#faq' }]
    },
    {
      id: 'yield',
      kw: ['תשואה', 'רווח', 'כמה מכניס', 'שכירות', 'yield', 'roi', 'return', 'profit', 'rental income', 'доходност', 'окупаемост', 'прибыл', 'аренд', 'შემოსავალ', 'მოგება'],
      ans: {
        he: 'על בסיס עסקאות שליווינו, תשואת שכירות שנתית ברוטו ב-New Gudauri נעה בין 8% ל-20% — תלוי בנכס, במיקום, בגודל ובניהול. נכסים קטנים ומנוהלים טוב, קרובים לגונדולה, מכניסים יותר. בנוסף יש את עליית הערך לאורך זמן. בשיחת ייעוץ חינם נבנה ניתוח תשואה לנכס ספציפי.',
        en: 'Based on deals we\'ve guided, gross annual rental yield in New Gudauri ranges from 8% to 20% — depending on the property, location, size and management. Small, well-managed properties close to the gondola earn more, and value appreciation adds to the total return. In a free consultation we\'ll build a yield analysis for a specific property.',
        ru: 'По сделкам, которые мы сопровождали, валовая годовая доходность аренды в Новом Гудаури — от 8% до 20%, в зависимости от объекта, локации, размера и управления. Небольшие, хорошо управляемые объекты рядом с гондолой приносят больше, плюс рост стоимости со временем. На бесплатной консультации составим расчёт по конкретному объекту.',
        ge: 'ჩვენი გარიგებების საფუძველზე, წლიური საიჯარო შემოსავალი ახალ გუდაურში 8%-დან 20%-მდეა — დამოკიდებულია ქონებაზე, მდებარეობაზე, ზომასა და მართვაზე. გონდოლასთან ახლოს მდებარე კარგად მართული ბინები მეტს გამოიმუშავებს. უფასო კონსულტაციაზე კონკრეტული ქონების ანალიზს ავაწყობთ.'
      },
      links: [{ t: { he: 'לעמוד המשקיעים ←', en: 'Investors page →', ru: 'Страница инвесторов →', ge: 'ინვესტორების გვერდი →' }, href: 'investors.html' }]
    },
    {
      id: 'activities',
      kw: ['פעילות', 'פעילויות', 'הליסקי', 'מצנח', 'רחיפה', 'טיול', 'טיולים', 'אטרקציות', 'activities', 'heliski', 'heli', 'paragliding', 'hiking', 'tours', 'attractions', 'things to do', 'активност', 'хелиски', 'параплан', 'экскурс', 'поход', 'აქტივობ', 'ჰელისკი', 'პარაპლან', 'ლაშქრობ'],
      ans: {
        he: 'מעבר לסקי וסנובורד: הליסקי בפסגות בתוליות, רחיפה במצנח מעל ההרים, הייקינג ואופני שטח, וטיולי יום לטביליסי — עיר בירה תוססת במרחק שעתיים. אפשר לשלב חופשת סקי עם חוויה גאורגית שלמה.',
        en: 'Beyond skiing and snowboarding: heliski on untouched peaks, paragliding over the mountains, hiking and mountain biking, and day trips to Tbilisi — a vibrant capital two hours away. You can combine a ski holiday with the full Georgian experience.',
        ru: 'Помимо лыж и сноуборда: хелиски на нетронутых вершинах, полёты на параплане над горами, походы и горные велосипеды, а также однодневные поездки в Тбилиси — яркую столицу в двух часах езды. Горнолыжный отдых легко совместить с полноценным грузинским путешествием.',
        ge: 'თხილამურებისა და სნოუბორდის გარდა: ჰელისკი ხელუხლებელ მწვერვალებზე, პარაპლანით ფრენა მთებზე, ლაშქრობა და მთის ველოსიპედები, და ერთდღიანი მოგზაურობები თბილისში. სათხილამურო დასვენება სრულ ქართულ გამოცდილებას შეუთავსეთ.'
      },
      links: [{ t: { he: 'לכל הפעילויות ←', en: 'All activities →', ru: 'Все активности →', ge: 'ყველა აქტივობა →' }, href: 'index.html#activities' }]
    },
    {
      id: 'hebrew',
      kw: ['עברית', 'מדריך', 'ליווי', 'שירות בעברית', 'דובר עברית', 'hebrew', 'guide', 'israeli service', 'иврит', 'гид', 'сопровожден', 'ებრაული', 'გიდი', 'თანხლება'],
      ans: {
        he: 'כן! כל השירות שלנו בעברית — גדעון ישראלי שגר ופועל בגודאורי. ליווי אישי מרגע התכנון, דרך ההגעה והצ׳ק-אין ועד סוף החופשה. גם מדריכי סקי דוברי עברית זמינים למתחילים.',
        en: 'Our service is personal and multilingual — Gidon is an Israeli who lives and works in Gudauri. Personal accompaniment from planning, through arrival and check-in, to the end of your trip. Hebrew-speaking ski instructors are also available for beginners.',
        ru: 'Наш сервис личный и многоязычный — Гидон живёт и работает в Гудаури. Личное сопровождение от планирования до конца поездки: трансфер, заселение, любые вопросы. Для новичков доступны и русскоговорящие инструкторы.',
        ge: 'ჩვენი სერვისი პირადი და მრავალენოვანია — გიდონი გუდაურში ცხოვრობს და მუშაობს. პირადი თანხლება დაგეგმვიდან მოგზაურობის ბოლომდე: ტრანსფერი, დაბინავება, ნებისმიერი კითხვა.'
      },
      links: [{ t: { he: 'דברו איתנו ←', en: 'Talk to us →', ru: 'Свяжитесь с нами →', ge: 'დაგვიკავშირდით →' }, href: 'https://wa.me/' + WA_NUMBER, ext: true }]
    },
    {
      id: 'contact',
      kw: ['קשר', 'טלפון', 'וואטסאפ', 'ווצאפ', 'מייל', 'אימייל', 'לדבר', 'נציג', 'אדם אמיתי', 'contact', 'phone', 'whatsapp', 'email', 'human', 'agent', 'talk', 'call', 'контакт', 'телефон', 'ватсап', 'почт', 'человек', 'позвонить', 'კონტაქტ', 'ტელეფონ', 'ვაცაპ'],
      ans: {
        he: 'הכי מהיר — וואטסאפ: +972 55-779-0955 (גדעון עונה אישית). אפשר גם במייל: gogudauri@newgudauri.net. יש גם קהילה חיה בוואטסאפ ובפייסבוק עם עדכונים ומבצעים.',
        en: 'Fastest way — WhatsApp: +972 55-779-0955 (Gidon answers personally). Email also works: gogudauri@newgudauri.net. There\'s also an active WhatsApp & Facebook community with updates and deals.',
        ru: 'Быстрее всего — WhatsApp: +972 55-779-0955 (Гидон отвечает лично). Также почта: gogudauri@newgudauri.net. Есть и живое сообщество в WhatsApp и Facebook с новостями и акциями.',
        ge: 'ყველაზე სწრაფი გზა — WhatsApp: +972 55-779-0955 (გიდონი პირადად პასუხობს). ასევე ელ-ფოსტა: gogudauri@newgudauri.net. გვაქვს აქტიური საზოგადოება WhatsApp-სა და Facebook-ზე.'
      },
      links: [{ t: { he: 'פתיחת וואטסאפ ←', en: 'Open WhatsApp →', ru: 'Открыть WhatsApp →', ge: 'WhatsApp-ის გახსნა →' }, href: 'https://wa.me/' + WA_NUMBER, ext: true }]
    },
    {
      id: 'greeting',
      kw: ['שלום', 'היי', 'הי ', 'בוקר טוב', 'ערב טוב', 'hello', 'hi', 'hey', 'good morning', 'shalom', 'привет', 'здравствуй', 'добрый', 'გამარჯობა', 'სალამი'],
      ans: {
        he: 'היי! 😊 איך אפשר לעזור? אפשר לשאול אותי על דירות, ציוד, הגעה, השקעות — או ללחוץ על אחת ההצעות למטה.',
        en: 'Hi! 😊 How can I help? Ask me about apartments, equipment, getting here, investing — or tap one of the suggestions below.',
        ru: 'Привет! 😊 Чем помочь? Спросите про апартаменты, снаряжение, дорогу, инвестиции — или нажмите на подсказку ниже.',
        ge: 'გამარჯობა! 😊 რით დაგეხმაროთ? მკითხეთ აპარტამენტებზე, აღჭურვილობაზე, მგზავრობაზე, ინვესტიციებზე — ან აირჩიეთ შემოთავაზება ქვემოთ.'
      },
      links: []
    },
    {
      id: 'thanks',
      kw: ['תודה', 'תודה רבה', 'מעולה', 'אחלה', 'thanks', 'thank you', 'great', 'perfect', 'awesome', 'спасибо', 'отлично', 'супер', 'მადლობა', 'დიდი მადლობა', 'კარგი'],
      ans: {
        he: 'בשמחה! 🎿 אם יש עוד שאלות — אני כאן. ולכל דבר אישי, גדעון זמין בוואטסאפ.',
        en: 'You\'re welcome! 🎿 If you have more questions — I\'m here. And for anything personal, Gidon is available on WhatsApp.',
        ru: 'Пожалуйста! 🎿 Если есть ещё вопросы — я здесь. А по личным вопросам Гидон на связи в WhatsApp.',
        ge: 'არაფრის! 🎿 თუ კიდევ გაქვთ კითხვები — აქ ვარ. პირადი საკითხებისთვის გიდონი WhatsApp-შია.'
      },
      links: []
    }
  ];

  /* chip → topic mapping (index matches UI.chips order) */
  var CHIP_TOPICS = ['apartments', 'equipment', 'transfer', 'invest'];

  /* ─── helpers ─── */
  function lang() {
    var l = null;
    try { l = localStorage.getItem('gudauri-lang'); } catch (e) {}
    return UI[l] ? l : 'he';
  }

  function normalize(s) {
    return (' ' + String(s).toLowerCase()
      .replace(/[֑-ׇ]/g, '')            /* Hebrew niqqud */
      .replace(/[״׳'".,!?;:()\-–—/\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() + ' ');
  }

  function findTopic(question) {
    var q = normalize(question);
    var qTrim = q.trim();
    var best = null, bestScore = 0;
    KB.forEach(function (topic) {
      var score = 0;
      topic.kw.forEach(function (kw) {
        var k = normalize(kw).trim(); /* same normalization as the query, so ״/׳ etc. match */
        if (!k) return;
        if (qTrim === k) { score += 4; return; } /* the whole message is the keyword ("שלום", "hi") */
        if (q.indexOf(k) !== -1) {
          /* specific multi-word phrases outrank accumulated single-word hits;
             whole-word hit counts like a long keyword — Hebrew/Georgian core words are short */
          var whole = q.indexOf(' ' + k + ' ') !== -1;
          score += k.indexOf(' ') !== -1 ? 4 : (k.length >= 5 || whole ? 2 : 1);
        }
      });
      if (score > bestScore) { bestScore = score; best = topic; }
    });
    return bestScore >= 2 ? best : null;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ─── styles ─── */
  var css = [
    '#gh-chat-btn{position:fixed;bottom:96px;left:24px;width:56px;height:56px;border-radius:50%;',
    'background:linear-gradient(135deg,#0EA5E9 0%,#0284C7 100%);color:#fff;display:flex;align-items:center;justify-content:center;',
    'box-shadow:0 4px 20px rgba(14,165,233,.45);z-index:997;border:none;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;}',
    '#gh-chat-btn:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(14,165,233,.55);}',
    '#gh-chat-btn.gh-hidden{opacity:0;pointer-events:none;transform:translateY(8px);}',
    '#gh-chat-btn svg{width:26px;height:26px;}',
    '#gh-chat-btn .gh-dot{position:absolute;top:2px;inset-inline-end:2px;width:12px;height:12px;border-radius:50%;background:#22C55E;border:2px solid #0F172A;}',
    '#gh-chat-panel{position:fixed;bottom:96px;left:24px;width:376px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100dvh - 120px);',
    'background:#0F172A;border:1px solid rgba(255,255,255,.12);border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,.55);',
    'z-index:1050;display:none;flex-direction:column;overflow:hidden;font-family:Heebo,-apple-system,sans-serif;}',
    '#gh-chat-panel.gh-open{display:flex;animation:ghUp .25s ease;}',
    '@keyframes ghUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}',
    '.gh-embed{position:relative;display:flex;flex-direction:column;overflow:hidden;width:100%;height:560px;',
    'background:linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,.02) 100%);border:1px solid rgba(255,255,255,.12);',
    'border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,.35);font-family:Heebo,-apple-system,sans-serif;}',
    '.gh-head{display:flex;align-items:center;gap:12px;padding:16px 18px;background:linear-gradient(135deg,rgba(14,165,233,.18) 0%,rgba(15,23,42,0) 70%);border-bottom:1px solid rgba(255,255,255,.08);}',
    '.gh-head-logo{width:38px;height:38px;border-radius:10px;background:rgba(14,165,233,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
    '.gh-head-logo svg{width:22px;height:22px;}',
    '.gh-head-name{font-weight:800;font-size:.9375rem;color:#F8FAFC;line-height:1.2;}',
    '.gh-head-sub{font-size:.75rem;color:#94A3B8;display:flex;align-items:center;gap:6px;}',
    '.gh-head-sub::before{content:"";width:7px;height:7px;border-radius:50%;background:#22C55E;}',
    '.gh-close{margin-inline-start:auto;background:none;border:none;color:#94A3B8;font-size:1.1rem;cursor:pointer;padding:6px 8px;border-radius:8px;line-height:1;}',
    '.gh-close:hover{color:#F8FAFC;background:rgba(255,255,255,.06);}',
    '.gh-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;}',
    '.gh-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:.875rem;line-height:1.55;white-space:pre-line;word-wrap:break-word;}',
    '.gh-msg-bot{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:#E2E8F0;align-self:flex-start;border-start-start-radius:4px;}',
    '.gh-msg-user{background:linear-gradient(135deg,#0EA5E9,#0284C7);color:#fff;align-self:flex-end;border-start-end-radius:4px;}',
    '.gh-msg a.gh-link{display:inline-flex;margin-top:8px;color:#38BDF8;font-weight:700;text-decoration:none;font-size:.8125rem;}',
    '.gh-msg a.gh-link:hover{text-decoration:underline;}',
    '.gh-msg a.gh-wa{display:inline-flex;align-items:center;gap:8px;margin-top:10px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;',
    'font-weight:700;font-size:.8125rem;padding:9px 16px;border-radius:10px;text-decoration:none;}',
    '.gh-typing{display:inline-flex;gap:4px;padding:12px 16px;}',
    '.gh-typing i{width:6px;height:6px;border-radius:50%;background:#64748B;animation:ghBlink 1s infinite;}',
    '.gh-typing i:nth-child(2){animation-delay:.15s}.gh-typing i:nth-child(3){animation-delay:.3s}',
    '@keyframes ghBlink{0%,80%,100%{opacity:.3}40%{opacity:1}}',
    '.gh-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 12px;}',
    '.gh-chip{background:rgba(14,165,233,.10);border:1px solid rgba(14,165,233,.35);color:#7DD3FC;font-size:.8125rem;font-weight:600;',
    'padding:7px 12px;border-radius:999px;cursor:pointer;transition:background .15s ease;font-family:inherit;}',
    '.gh-chip:hover{background:rgba(14,165,233,.22);}',
    '.gh-input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);}',
    '.gh-input{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#F8FAFC;',
    'padding:11px 14px;font-size:.875rem;font-family:inherit;outline:none;min-width:0;}',
    '.gh-input:focus{border-color:#0EA5E9;}',
    '.gh-input::placeholder{color:#64748B;}',
    '.gh-send{background:#0EA5E9;border:none;color:#fff;border-radius:12px;width:44px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s ease;}',
    '.gh-send:hover{background:#0284C7;}',
    '.gh-send svg{width:18px;height:18px;}',
    '#gh-chat-btn:focus-visible,.gh-chip:focus-visible,.gh-send:focus-visible,.gh-close:focus-visible{outline:2px solid #38BDF8;outline-offset:2px;}',
    '@media (max-width:520px){',
    '#gh-chat-btn{bottom:78px;left:16px;width:50px;height:50px;}',
    '#gh-chat-btn svg{width:23px;height:23px;}',
    '#gh-chat-panel{left:8px;right:8px;bottom:8px;width:auto;height:78dvh;max-height:none;border-radius:18px;}',
    '.gh-embed{height:480px;}',
    '.gh-input{font-size:16px;}', /* ≥16px so iOS Safari doesn't zoom on focus */
    '}',
    '@media (prefers-reduced-motion:reduce){#gh-chat-panel.gh-open{animation:none;}#gh-chat-btn{transition:none;}.gh-typing i{animation:none;opacity:.6;}}'
  ].join('');

  /* ─── shared SVG fragments ─── */
  var LOGO_SVG = '<svg viewBox="0 0 36 36" fill="none"><g stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="5" x2="18" y2="31"/><line x1="18" y1="9.5" x2="15" y2="7"/><line x1="18" y1="9.5" x2="21" y2="7"/><line x1="18" y1="26.5" x2="15" y2="29"/><line x1="18" y1="26.5" x2="21" y2="29"/><g transform="rotate(60 18 18)"><line x1="18" y1="5" x2="18" y2="31"/><line x1="18" y1="9.5" x2="15" y2="7"/><line x1="18" y1="9.5" x2="21" y2="7"/><line x1="18" y1="26.5" x2="15" y2="29"/><line x1="18" y1="26.5" x2="21" y2="29"/></g><g transform="rotate(120 18 18)"><line x1="18" y1="5" x2="18" y2="31"/><line x1="18" y1="9.5" x2="15" y2="7"/><line x1="18" y1="9.5" x2="21" y2="7"/><line x1="18" y1="26.5" x2="15" y2="29"/><line x1="18" y1="26.5" x2="21" y2="29"/></g></g><circle cx="18" cy="18" r="2" fill="#7DD3FC"/></svg>';
  var SEND_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
  var WA_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  /* ─── chat instance factory — used by the floating panel AND the inline embed ─── */
  function createChat(root, withClose) {
    var t = UI[lang()];
    root.innerHTML =
      '<div class="gh-head">' +
        '<div class="gh-head-logo" aria-hidden="true">' + LOGO_SVG + '</div>' +
        '<div><div class="gh-head-name">' + esc(t.title) + '</div>' +
        '<div class="gh-head-sub">' + esc(t.subtitle) + '</div></div>' +
        (withClose ? '<button class="gh-close" type="button" aria-label="' + esc(t.close) + '">✕</button>' : '') +
      '</div>' +
      '<div class="gh-msgs" aria-live="polite"></div>' +
      '<div class="gh-chips"></div>' +
      '<div class="gh-input-row">' +
        '<input class="gh-input" type="text" maxlength="300" autocomplete="off" enterkeyhint="send" placeholder="' + esc(t.placeholder) + '" aria-label="' + esc(t.placeholder) + '" />' +
        '<button class="gh-send" type="button" aria-label="' + esc(t.send) + '">' + SEND_SVG + '</button>' +
      '</div>';

    var inst = {
      root: root,
      greeted: false,
      pristine: true, /* nothing but the greeting yet — safe to re-render on language switch */
      msgs: root.querySelector('.gh-msgs'),
      chips: root.querySelector('.gh-chips'),
      input: root.querySelector('.gh-input')
    };

    function scrollDown() { inst.msgs.scrollTop = inst.msgs.scrollHeight; }

    function topicHtml(topic, L) {
      var html = esc(topic.ans[L]).replace(/\n/g, '<br>');
      (topic.links || []).forEach(function (link) {
        html += '<br><a class="gh-link" href="' + esc(link.href) + '"' +
          (link.ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(link.t[L]) + '</a>';
      });
      return html;
    }

    inst.addUser = function (text) {
      inst.pristine = false;
      var d = document.createElement('div');
      d.className = 'gh-msg gh-msg-user';
      d.textContent = text;
      inst.msgs.appendChild(d);
      scrollDown();
    };

    inst.addBot = function (html) {
      var d = document.createElement('div');
      d.className = 'gh-msg gh-msg-bot';
      d.innerHTML = html; /* bot content only — never user input */
      inst.msgs.appendChild(d);
      scrollDown();
      return d;
    };

    inst.typing = function () {
      var d = document.createElement('div');
      d.className = 'gh-msg gh-msg-bot gh-typing';
      d.setAttribute('aria-hidden', 'true');
      d.innerHTML = '<i></i><i></i><i></i>';
      inst.msgs.appendChild(d);
      scrollDown();
      return d;
    };

    inst.answer = function (question) {
      var L = lang();
      var ui = UI[L];
      var dots = inst.typing();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(function () {
        dots.remove();
        var topic = findTopic(question);
        if (topic) {
          inst.addBot(topicHtml(topic, L));
        } else {
          var waHref = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(question);
          inst.addBot(
            esc(ui.fallback) +
            '<br><a class="gh-wa" href="' + waHref + '" target="_blank" rel="noopener noreferrer">' +
            WA_SVG + esc(ui.waBtn) + '</a>'
          );
        }
      }, reduce ? 60 : 550 + Math.random() * 350);
    };

    inst.send = function () {
      var text = inst.input.value.trim();
      if (!text) return;
      inst.input.value = '';
      inst.addUser(text);
      inst.answer(text);
    };

    inst.renderChips = function () {
      var L = lang();
      inst.chips.innerHTML = '';
      UI[L].chips.forEach(function (label, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'gh-chip';
        b.textContent = label;
        b.addEventListener('click', function () {
          inst.addUser(label.replace(/^[^\s]+\s/, ''));
          var topic = KB.filter(function (k) { return k.id === CHIP_TOPICS[i]; })[0];
          var dots = inst.typing();
          setTimeout(function () {
            dots.remove();
            inst.addBot(topicHtml(topic, lang()));
          }, 450);
        });
        inst.chips.appendChild(b);
      });
    };

    inst.greet = function () {
      inst.greeted = true;
      inst.addBot(esc(UI[lang()].greeting).replace(/\n/g, '<br>'));
    };

    inst.applyLang = function () {
      var L = lang();
      var ui = UI[L];
      root.dir = ui.dir;
      root.setAttribute('aria-label', ui.title);
      root.querySelector('.gh-head-sub').textContent = ui.subtitle;
      inst.input.placeholder = ui.placeholder;
      inst.input.setAttribute('aria-label', ui.placeholder);
      root.querySelector('.gh-send').setAttribute('aria-label', ui.send);
      var closeBtn = root.querySelector('.gh-close');
      if (closeBtn) closeBtn.setAttribute('aria-label', ui.close);
      inst.renderChips();
      /* untouched chat → re-render the greeting in the new language */
      if (inst.greeted && inst.pristine) {
        inst.msgs.innerHTML = '';
        inst.addBot(esc(ui.greeting).replace(/\n/g, '<br>'));
      }
    };

    root.querySelector('.gh-send').addEventListener('click', inst.send);
    inst.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); inst.send(); }
    });

    return inst;
  }

  /* ─── floating widget + inline embed ─── */
  var floatChat = null, inlineChat = null, floatBtn = null, floatPanel = null, opened = false;

  function toggle(open) {
    opened = open === undefined ? !opened : open;
    floatPanel.classList.toggle('gh-open', opened);
    floatBtn.setAttribute('aria-expanded', String(opened));
    if (opened) {
      floatChat.applyLang();
      if (!floatChat.greeted) floatChat.greet();
      floatChat.input.focus();
    } else {
      floatBtn.focus();
    }
  }

  function init() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var t = UI[lang()];

    /* floating launcher + panel (every page) */
    floatBtn = document.createElement('button');
    floatBtn.id = 'gh-chat-btn';
    floatBtn.type = 'button';
    floatBtn.setAttribute('aria-label', t.launcher);
    floatBtn.setAttribute('aria-expanded', 'false');
    floatBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
      '<line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="13" y2="13"/></svg>' +
      '<span class="gh-dot" aria-hidden="true"></span>';

    floatPanel = document.createElement('div');
    floatPanel.id = 'gh-chat-panel';
    floatPanel.setAttribute('role', 'dialog');
    floatPanel.setAttribute('aria-modal', 'false');

    document.body.appendChild(floatBtn);
    document.body.appendChild(floatPanel);
    floatChat = createChat(floatPanel, true);
    floatChat.applyLang();

    floatBtn.addEventListener('click', function () { toggle(); });
    floatPanel.querySelector('.gh-close').addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && opened) toggle(false);
    });

    /* inline embed — any page with a #gh-inline mount gets an always-open chat */
    var mount = document.getElementById('gh-inline');
    if (mount) {
      mount.classList.add('gh-embed');
      mount.setAttribute('role', 'group');
      inlineChat = createChat(mount, false);
      inlineChat.applyLang();
      inlineChat.greet();

      /* the launcher is redundant while the inline chat is on screen */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          floatBtn.classList.toggle('gh-hidden', entries[0].isIntersecting);
        }, { threshold: 0.2 }).observe(mount);
      }
    }

    /* follow the site language switcher */
    new MutationObserver(function () {
      if (opened) floatChat.applyLang();
      if (inlineChat) inlineChat.applyLang();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  /* minimal public API — lets other scripts (or tests) open the chat or query the matcher */
  window.GudauriChat = {
    match: findTopic,
    open: function () { if (floatPanel) toggle(true); },
    close: function () { if (floatPanel) toggle(false); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
