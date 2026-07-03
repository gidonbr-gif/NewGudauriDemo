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

---

# Site-wide premium upgrade (2026-07-03)

- [x] Reviews: removed Unsplash stock-face avatars from index testimonials; author row is now name + city with an accent bar (premium, no fake faces)
- [x] Security: fixed DOM XSS in payment-success.html (URL params sanitized + HTML-escaped before innerHTML)
- [x] Security: CORS on /api/* restricted to site origins via api/_cors.js (was `*`); vercel.json adds nosniff/XFO/Referrer-Policy/Permissions-Policy + cache headers for images & lotties
- [x] SEO: hreflang `ge`→`ka` on all pages; investors.html got hreflang + twitter card + ProfessionalService & FAQPage schema; investors added to sitemap.xml; page-specific og:images (real photos, with dimensions); SVG favicon on every page
- [x] Performance: siot PNGs → JPG (7.5MB→0.4MB), loft2 IMG_0821 4MB→209KB, atrium/investor-profile resized to ≤1600px; lina galleries lazy-hydrate (38 of 44 slides deferred, IO + first-interaction); LCP hero preloads + unsplash preconnect on index/lina/equipment/new-gudauri-info/investors; lottie scripts deferred; unpkg lottie-player pinned to 2.0.12; TripAdvisor hotlink replaced with local webp
- [x] i18n: footer consent + email aria + legal links + copy now translated ×4 langs on lina/investors/new-gudauri-info; "החל מ-" (lina.price.from) translated; audits: 0 missing keys
- [x] A11y: focus-visible on terms/privacy/payment-success; removed aria-hidden from focusable gallery arrows; reduced-motion guards for lottie snow/badges; alt/width/height on investor photo
- [x] Fixed pre-existing test failure (payment-success missing `direction: rtl`) and broken regex in _verify_i18n.js

## Review
- `npm test`: 7/7 pass
- `node tasks/_audit_i18n.cjs`: 0 missing / 0 partial on all pages
- `node tasks/_audit_untranslated.cjs`: only address + accessibility-widget noscript remain (deliberate, same as index)
- `node --check` passes on all JS incl. api/
- JSON-LD blocks on all 5 pages parse; vercel.json valid
- All local image/lottie/page refs resolve

## Chat assistant (2026-07-03)
- [x] gudauri-chat.js — self-contained chat widget on index.html: 16-topic knowledge base from all site pages ×4 langs, keyword matcher (33/33 smoke tests), WhatsApp fallback pre-filling the visitor's question to +972 55-779-0955. Launcher above wa-fab (bottom-left). Follows site language switcher, RTL/LTR aware, a11y + reduced-motion. `window.GudauriChat` API (match/open/close).

## Critical self-review (2026-07-03, pre-launch)
Headless-browser smoke test (Chromium via playwright-core): all 8 pages loaded at desktop+mobile viewports; console errors, failed requests, i18n parity (×4 langs), exact-case asset refs, dup IDs, alt text — all checked.

### Bugs found & fixed
- [x] `lottie is not defined` on index/privacy/terms: inline init ran at parse time while lottie.min.js is `defer`red → wrapped in DOMContentLoaded (animations were dead + console error)
- [x] Dead "New Gudauri Live" card on index: video muLuTWjOZqs deleted (link + thumbnail 404) → now links to the channel's self-healing /live URL (@gudauriflats/live) with a local webp thumbnail that can't rot
- [x] Stray old-logo dot (circle cy=30) left in index nav snowflake — removed (all other pages were clean)
- [x] `_verify_i18n.js` broken by `"type":"module"` in package.json → renamed to `_verify_i18n.cjs`

### Verified non-issues
- Chat launcher unclickable pre-consent: cookie overlay (z 99998) blocks by design; after "קבל הכל" chat opens and answers correctly
- new-gudauri-info 24px scrollWidth on mobile: clipped by body overflow-x:hidden, page does not actually pan (scrollX stays 0)
- payment-success `type`/`apt` params: only compared to fixed strings, never injected; `lang` validated against PS keys

### Final checks
- npm test 7/7; _verify_i18n.cjs 140 keys ×4 langs OK; all inline scripts parse; all local refs resolve (exact case); no hreflang="ge" left; preloaded heroes match used images; sitemap covers all indexable pages
