# CRM Implementation Tasks

- [x] Write failing CRM API and static site tests.
- [x] Add Airtable-backed Vercel API endpoint.
- [x] Add CRM lead capture form and client script.
- [x] Update WhatsApp links with service-specific messages.
- [x] Add environment documentation without secrets.
- [x] Run verification and document results.
- [x] Add internal CRM launcher page for non-technical access.

## Review

- `npm test` passes: 7 tests, 0 failures.
- `node --check api/leads.js` passes.
- `node --check crm-leads.js` passes.
- `node --check crm-launcher.js` passes.
- `rg` found no Airtable API key patterns in public HTML/JS files.

---

# UI/UX review — 4 languages (2026-06-02)

## ✅ הושלם ונבדק
**ניווט (כל 5 העמודים):**
- [x] תרגומי nav חסרים: equipment (`nav.about`,`nav.activities`), investors (`nav.activities`,`nav.equipment`) ×4 שפות
- [x] ניקוי עיצוב: צ'יפים ממוסגרים → קישורי טקסט נקיים; hover עדין; active בתכלת
- [x] breakpoint למבורגר 1180→1280px (מונע גלישה בגאורגית/רוסית); דגלים תמיד גלויים
- בדיקה: `node tasks/_audit_i18n.cjs` → 0 חסרים/חלקיים בכל העמודים

**index.html — טקסטים לא מתורגמים:**
- [x] סרגל קהילה (`community.join/wa/fb/ig`), הסכמת דיוור (`footer.newsletter.consent`), יחידות עובדות (`fact*.unit`)
- בדיקה: 14→3 פריטים (כתובת + ווידג'ט נגישות, תקינים); 172 מפתחות, 0 חסרים

## ⏸️ ממתין לאישור ויזואלי (המשתמש בחר "עצור כאן בינתיים")
לאמת: ניווט+דגלים ב-lina.html גאורגית; סרגל קהילה ב-index.html אנגלית

## ⬜ נשאר (אחרי אישור)
- [ ] investors / lina / new-gudauri-info — הסכמת דיוור + קישורי פוטר + "החל מ-" + "הגדרות קוקיז"
- [ ] equipment.html — ✅ כבר נקי
- [ ] החלטה: לתרגם "ישראל" בכתובת?

## כלים
- `tasks/_audit_i18n.cjs` — כל data-i18n מוגדר ב-4 שפות
- `tasks/_audit_untranslated.cjs` — טקסט עברי גלוי ללא data-i18n
