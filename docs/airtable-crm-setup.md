# Gudauri CRM Airtable Setup

Create an Airtable base named `Gudauri CRM` with one table named `Leads`.

## Leads Fields

| Field | Type | Notes |
| --- | --- | --- |
| שם | Single line text | Required by the website form |
| טלפון | Phone number | Required by the website form |
| שירות | Single select | הזמנת נסיעות, הזמנת ציוד, הזמנת דירות, ליווי משקיעים |
| מקור | Single line text | Website page or form source |
| סטטוס | Single select | חדש, נוצר קשר, ממתין לתשובה, הצעה נשלחה, נסגר, לא רלוונטי |
| הערות | Long text | Free notes from the visitor or team |
| תאריך חזרה | Date | Optional follow-up date |
| שווי משוער | Currency or number | Optional estimated value |
| תאריך יצירה | Date/time | Sent by the website API |

## Equipment orders

Orders from `equipment.html` need a valid email (the API rejects an equipment lead without one).
Person 1's choices go to the equipment columns (`סוג ציוד`, `רמת ציוד`, `מידת נעל`, …).
For groups, `הערות` also lists `מספר אנשים` and one `אדם N: …` line per person (type, level, sizes, goggles),
plus the price estimate (`הערכת עלות: ₾… (≈ ₪…)`), so no extra column is needed.
Equipment levels are now `kids`, `basic` and `pro`; if a select column rejects a value the order is still saved,
with the equipment details written into `הערות`.

## Recommended Views

- `כל הלידים`: all records, newest first.
- `חדשים`: filter where `סטטוס` is `חדש`.
- `צריך לחזור אליהם`: filter where `תאריך חזרה` is today or earlier and status is not `נסגר` or `לא רלוונטי`.
- `נסגרו`: filter where `סטטוס` is `נסגר`.

## Vercel Environment Variables

Add these variables in Vercel Project Settings -> Environment Variables:

```env
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AIRTABLE_LEADS_TABLE=Leads
```

Keep the real values only in Vercel or a local ignored `.env` file. Do not paste them into HTML or public JavaScript files.
