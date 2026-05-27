/**
 * Cookie Consent – NewGudauri
 * עברית · RTL · חוק הגנת הפרטיות (ישראל) + GDPR
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ng_cookie_consent';

  /* ─── CSS ─── */
  const CSS = `
    #ng-cookie-overlay {
      position: fixed; inset: 0; background: rgba(10,15,28,0.7);
      z-index: 99998; display: flex; align-items: flex-end;
      justify-content: center; padding: 0 16px 24px;
      font-family: 'Heebo', sans-serif; direction: rtl;
      animation: ngFadeIn 0.3s ease;
    }
    @keyframes ngFadeIn { from { opacity: 0 } to { opacity: 1 } }

    #ng-cookie-banner {
      background: #1E293B;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 16px;
      padding: 24px 28px;
      max-width: 680px; width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      animation: ngSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes ngSlideUp { from { transform: translateY(30px); opacity:0 } to { transform: translateY(0); opacity:1 } }

    #ng-cookie-banner h2 {
      font-size: 17px; font-weight: 700; color: #F8FAFC;
      margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
    }
    #ng-cookie-banner p {
      font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 20px;
    }
    #ng-cookie-banner a { color: #38BDF8; text-decoration: underline; }

    .ng-btn-row {
      display: flex; gap: 10px; flex-wrap: wrap;
    }
    .ng-btn {
      flex: 1; min-width: 130px; padding: 10px 16px;
      border-radius: 10px; font-family: inherit; font-size: 14px;
      font-weight: 600; cursor: pointer; border: none;
      transition: filter 0.15s ease;
    }
    .ng-btn:hover { filter: brightness(1.1); }
    .ng-btn-accept  { background: #0EA5E9; color: #fff; }
    .ng-btn-reject  { background: #334155; color: #94A3B8; }
    .ng-btn-manage  { background: transparent; color: #38BDF8;
                      border: 1px solid rgba(56,189,248,0.35); }

    /* ─── Preferences Modal ─── */
    #ng-prefs-overlay {
      position: fixed; inset: 0; background: rgba(10,15,28,0.8);
      z-index: 99999; display: flex; align-items: center; justify-content: center;
      padding: 16px; font-family: 'Heebo', sans-serif; direction: rtl;
      animation: ngFadeIn 0.25s ease;
    }
    #ng-prefs-panel {
      background: #1E293B; border: 1px solid rgba(255,255,255,0.10);
      border-radius: 16px; padding: 28px; max-width: 520px; width: 100%;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 24px 70px rgba(0,0,0,0.7);
      animation: ngSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    #ng-prefs-panel h2 {
      font-size: 18px; font-weight: 700; color: #F8FAFC; margin-bottom: 6px;
    }
    #ng-prefs-panel > p {
      font-size: 13px; color: #94A3B8; margin-bottom: 20px; line-height: 1.6;
    }
    #ng-prefs-panel a { color: #38BDF8; text-decoration: underline; }

    .ng-category {
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 16px; margin-bottom: 12px;
      background: rgba(255,255,255,0.03);
    }
    .ng-category-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 6px;
    }
    .ng-category-title {
      font-size: 15px; font-weight: 600; color: #F8FAFC;
    }
    .ng-category-desc {
      font-size: 13px; color: #94A3B8; line-height: 1.5; margin-bottom: 10px;
    }

    /* Toggle Switch */
    .ng-toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
    .ng-toggle input { opacity: 0; width: 0; height: 0; }
    .ng-toggle-slider {
      position: absolute; inset: 0; background: #334155; border-radius: 24px;
      cursor: pointer; transition: background 0.2s;
    }
    .ng-toggle-slider::before {
      content: ''; position: absolute; width: 18px; height: 18px;
      background: #fff; border-radius: 50%;
      right: 3px; top: 3px; transition: transform 0.2s;
    }
    .ng-toggle input:checked + .ng-toggle-slider { background: #0EA5E9; }
    .ng-toggle input:checked + .ng-toggle-slider::before { transform: translateX(-20px); }
    .ng-toggle input:disabled + .ng-toggle-slider { opacity: 0.5; cursor: not-allowed; }
    .ng-always-on { font-size: 12px; color: #475569; }

    /* Disclosures */
    .ng-disclosures-toggle {
      background: none; border: none; color: #38BDF8; font-family: inherit;
      font-size: 12px; cursor: pointer; padding: 0; margin-top: 4px;
      display: flex; align-items: center; gap: 4px;
    }
    .ng-disclosures-toggle::before { content: '▸'; transition: transform 0.2s; }
    .ng-disclosures-toggle.open::before { transform: rotate(90deg); }
    .ng-disclosure-table {
      display: none; margin-top: 10px;
      border-collapse: collapse; width: 100%; font-size: 12px;
    }
    .ng-disclosure-table.open { display: table; }
    .ng-disclosure-table th {
      text-align: right; color: #475569; font-weight: 600;
      padding: 4px 8px; border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .ng-disclosure-table td {
      color: #94A3B8; padding: 5px 8px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }

    .ng-prefs-actions {
      display: flex; gap: 10px; margin-top: 20px;
    }
    .ng-btn-save { flex: 1; background: #0EA5E9; color: #fff; }
    .ng-btn-close-prefs { background: #334155; color: #94A3B8; }

    /* Cookie Settings Footer Button */
    #ng-cookie-settings-btn {
      background: none; border: none; color: #475569; font-family: 'Heebo', sans-serif;
      font-size: 13px; cursor: pointer; text-decoration: underline;
      padding: 0; transition: color 0.15s;
    }
    #ng-cookie-settings-btn:hover { color: #94A3B8; }

    @media (max-width: 500px) {
      #ng-cookie-banner { padding: 20px; }
      .ng-btn { font-size: 13px; padding: 9px 12px; }
      #ng-prefs-panel { padding: 20px; }
    }
  `;

  /* ─── Cookie Categories ─── */
  const CATEGORIES = [
    {
      id: 'essential',
      label: '🔒 קוקיז חיוניים',
      desc: 'הכרחיים לתפעול האתר. מאחסנים את העדפות ההסכמה שלך. לא ניתן לבטל.',
      alwaysOn: true,
      cookies: [
        { name: 'ng_cookie_consent', purpose: 'שמירת העדפות ההסכמה', duration: 'שנה' }
      ]
    },
    {
      id: 'functional',
      label: '⚙️ קוקיז פונקציונליים',
      desc: 'משפרים את חווית הגלישה — כגון שמירת שפה מועדפת וכפתור הנגישות (Tabnav).',
      alwaysOn: false,
      cookies: [
        { name: 'tabnav_*', purpose: 'ווידג\'ט הנגישות Tabnav', duration: 'שנה' },
        { name: 'lang_pref', purpose: 'שפת ממשק מועדפת', duration: 'שנה' }
      ]
    },
    {
      id: 'analytics',
      label: '📊 קוקיז אנליטיקה',
      desc: 'עוזרים לנו להבין כיצד גולשים משתמשים באתר, כדי לשפרו. כל הנתונים אנונימיים.',
      alwaysOn: false,
      cookies: [
        { name: '_ga, _gid', purpose: 'Google Analytics — ניתוח תנועה אנונימי', duration: '2 שנים / 24 שעות' }
      ]
    }
  ];

  /* ─── Helpers ─── */
  function getStored() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
  }
  function store(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, timestamp: new Date().toISOString() }));
    window.dispatchEvent(new CustomEvent('ng-cookie-consent-updated', { detail: prefs }));
  }
  function injectCSS() {
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  function remove(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  /* ─── Build Disclosure Table ─── */
  function buildDisclosure(cookies) {
    const rows = cookies.map(c =>
      `<tr><td>${c.name}</td><td>${c.purpose}</td><td>${c.duration}</td></tr>`
    ).join('');
    return `
      <table class="ng-disclosure-table">
        <thead><tr><th>שם</th><th>מטרה</th><th>תוקף</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  /* ─── Show Preferences Panel ─── */
  function showPrefs(stored) {
    remove('ng-prefs-overlay');
    const prefs = stored || getStored() || { essential: true, functional: true, analytics: false };

    const cats = CATEGORIES.map(cat => {
      const checked = cat.alwaysOn ? true : (prefs[cat.id] !== false);
      return `
        <div class="ng-category">
          <div class="ng-category-header">
            <span class="ng-category-title">${cat.label}</span>
            ${cat.alwaysOn
              ? `<span class="ng-always-on">תמיד פעיל</span>`
              : `<label class="ng-toggle">
                   <input type="checkbox" id="ng-toggle-${cat.id}" ${checked ? 'checked' : ''}>
                   <span class="ng-toggle-slider"></span>
                 </label>`}
          </div>
          <p class="ng-category-desc">${cat.desc}</p>
          <button class="ng-disclosures-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
            פרטי קוקיז
          </button>
          ${buildDisclosure(cat.cookies)}
        </div>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.id = 'ng-prefs-overlay';
    overlay.innerHTML = `
      <div id="ng-prefs-panel" role="dialog" aria-modal="true" aria-label="הגדרות קוקיז">
        <h2>🍪 הגדרות קוקיז</h2>
        <p>בחר אילו קוקיז תרצה לאפשר. קוקיז חיוניים תמיד פעילים.
           <a href="/privacy-policy.html" target="_blank">מדיניות פרטיות ←</a></p>
        ${cats}
        <div class="ng-prefs-actions">
          <button class="ng-btn ng-btn-save" id="ng-save-prefs">שמור העדפות</button>
          <button class="ng-btn ng-btn-reject ng-btn-close-prefs" id="ng-close-prefs">סגור</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    document.getElementById('ng-save-prefs').onclick = function () {
      const saved = { essential: true };
      CATEGORIES.forEach(cat => {
        if (!cat.alwaysOn) {
          const el = document.getElementById('ng-toggle-' + cat.id);
          saved[cat.id] = el ? el.checked : false;
        }
      });
      store(saved);
      remove('ng-prefs-overlay');
      remove('ng-cookie-overlay');
    };

    document.getElementById('ng-close-prefs').onclick = function () {
      remove('ng-prefs-overlay');
    };

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) remove('ng-prefs-overlay');
    });
  }

  /* ─── Show Main Banner ─── */
  function showBanner() {
    const overlay = document.createElement('div');
    overlay.id = 'ng-cookie-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'הסכמה לשימוש בקוקיז');

    overlay.innerHTML = `
      <div id="ng-cookie-banner">
        <h2>🍪 אנחנו משתמשים בקוקיז</h2>
        <p>
          אנו משתמשים בקוקיז כדי להבטיח את תפעול האתר, לשפר את חווית הגלישה
          ולנתח תנועה באופן אנונימי — בהתאם לחוק הגנת הפרטיות הישראלי ותקנות GDPR.
          <br><a href="/privacy-policy.html" target="_blank">מדיניות פרטיות</a>
        </p>
        <div class="ng-btn-row">
          <button class="ng-btn ng-btn-accept" id="ng-accept-all">✓ קבל הכל</button>
          <button class="ng-btn ng-btn-manage" id="ng-manage-prefs">⚙ הגדרות</button>
          <button class="ng-btn ng-btn-reject" id="ng-reject-non">רק חיוניים</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    document.getElementById('ng-accept-all').onclick = function () {
      const all = { essential: true };
      CATEGORIES.forEach(c => { if (!c.alwaysOn) all[c.id] = true; });
      store(all);
      remove('ng-cookie-overlay');
    };

    document.getElementById('ng-reject-non').onclick = function () {
      const minimal = { essential: true };
      CATEGORIES.forEach(c => { if (!c.alwaysOn) minimal[c.id] = false; });
      store(minimal);
      remove('ng-cookie-overlay');
    };

    document.getElementById('ng-manage-prefs').onclick = function () {
      remove('ng-cookie-overlay');
      showPrefs(null);
    };
  }

  /* ─── Init ─── */
  function init() {
    injectCSS();

    // Show banner only if no consent stored yet
    if (!getStored()) {
      showBanner();
    }

    // Listen for reopen event (from footer button)
    window.addEventListener('ng-reopen-cookie-consent', function () {
      remove('ng-cookie-overlay');
      showPrefs(null);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.ngCookieConsent = {
    getPreferences: getStored,
    reopen: function () { window.dispatchEvent(new Event('ng-reopen-cookie-consent')); },
    hasConsent: function (cat) {
      const p = getStored();
      return p ? (p[cat] === true) : false;
    }
  };

})();
