(function () {
  var PHONE = '972557790955';
  var SERVICES = {
    travel: 'הזמנת נסיעות',
    equipment: 'הזמנת ציוד',
    apartments: 'הזמנת דירות',
    investors: 'ליווי משקיעים'
  };

  function pageService() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf('lina') !== -1) return 'apartments';
    if (path.indexOf('new-gudauri-info') !== -1) return 'equipment';
    return 'travel';
  }

  function messageFor(service) {
    return 'שלום, אני מתעניין ב' + SERVICES[service] + ' בגודאורי. אשמח שתחזרו אליי.';
  }

  function whatsappUrl(service) {
    return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(messageFor(service));
  }

  function enhanceWhatsAppLinks() {
    var service = pageService();
    document.querySelectorAll('a[href*="wa.me/972557790955"]').forEach(function (link) {
      if (link.href.indexOf('text=') === -1) link.href = whatsappUrl(service);
    });
  }

  function addStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '.crm-lead-section{direction:rtl;text-align:right;background:#f8fafc;color:#0f172a;padding:72px 0;scroll-margin-top:var(--nav-h,72px);}',
      '.crm-lead-wrap{width:min(1120px,calc(100% - 32px));margin-inline:auto;display:grid;grid-template-columns:1fr 1.2fr;gap:28px;align-items:start;}',
      '.crm-lead-copy h2{font-size:clamp(1.8rem,3vw,2.8rem);line-height:1.15;margin:0 0 12px;color:#0f172a;}',
      '.crm-lead-copy p{margin:0;color:#475569;font-size:1.05rem;line-height:1.8;}',
      '.crm-lead-form{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;box-shadow:0 16px 42px rgba(15,23,42,.10);display:grid;gap:16px;}',
      '.crm-lead-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}',
      '.crm-lead-field{display:grid;gap:6px;}',
      '.crm-lead-field label{font-weight:700;color:#1e293b;font-size:.95rem;}',
      '.crm-lead-field input,.crm-lead-field select,.crm-lead-field textarea{width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:12px 14px;font:inherit;color:#0f172a;background:#fff;text-align:right;}',
      '.crm-lead-field textarea{min-height:96px;resize:vertical;}',
      '.crm-lead-checkboxes{display:grid;gap:10px;}',
      '.crm-lead-checkbox{display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:.875rem;line-height:1.55;color:#334155;}',
      '.crm-lead-checkbox input[type="checkbox"]{width:17px;height:17px;margin-top:2px;flex-shrink:0;accent-color:#0ea5e9;cursor:pointer;}',
      '.crm-lead-checkbox a{color:#0ea5e9;text-decoration:underline;}',
      '.crm-lead-actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center;}',
      '.crm-submit{min-height:48px;border-radius:8px;padding:0 28px;font-weight:800;font-size:1rem;display:inline-flex;align-items:center;justify-content:center;background:#0ea5e9;color:#fff;border:0;cursor:pointer;transition:background .2s,transform .15s;}',
      '.crm-submit:hover{background:#0284c7;transform:translateY(-1px);}',
      '.crm-submit:disabled{opacity:.6;cursor:not-allowed;transform:none;}',
      '.crm-lead-status{font-weight:700;min-height:24px;color:#475569;}',
      '.crm-lead-status[data-state="success"]{color:#15803d;}',
      '.crm-lead-status[data-state="error"]{color:#b91c1c;}',
      '@media (max-width: 760px){.crm-lead-wrap,.crm-lead-grid{grid-template-columns:1fr}.crm-lead-section{padding:48px 0}.crm-lead-form{padding:18px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function createForm() {
    var service = pageService();
    var section = document.createElement('section');
    section.className = 'crm-lead-section';
    section.id = 'lead-form';
    section.innerHTML = '' +
      '<div class="crm-lead-wrap">' +
        '<div class="crm-lead-copy">' +
          '<h2>השאירו פרטים ונחזור אליכם בהקדם האפשרי</h2>' +
          '<p>שלחו לנו את הפרטים ואחד מנציגינו יחזור אליכם בהקדם עם הצעה מותאמת אישית. כל פנייה מטופלת באופן אישי ומסודר.</p>' +
        '</div>' +
        '<form class="crm-lead-form" novalidate>' +
          '<div class="crm-lead-grid">' +
            '<div class="crm-lead-field"><label for="crm-name">שם מלא</label><input id="crm-name" name="name" autocomplete="name" required></div>' +
            '<div class="crm-lead-field"><label for="crm-phone">טלפון</label><input id="crm-phone" name="phone" autocomplete="tel" required></div>' +
          '</div>' +
          '<div class="crm-lead-grid">' +
            '<div class="crm-lead-field"><label for="crm-service">סוג פנייה</label><select id="crm-service" name="service">' +
              '<option value="travel">הזמנת נסיעות</option>' +
              '<option value="equipment">הזמנת ציוד</option>' +
              '<option value="apartments">הזמנת דירות</option>' +
              '<option value="investors">ליווי משקיעים</option>' +
            '</select></div>' +
            '<div class="crm-lead-field"><label for="crm-email">כתובת מייל</label><input id="crm-email" name="email" type="email" autocomplete="email" placeholder="example@email.com" dir="ltr"></div>' +
          '</div>' +
          '<div class="crm-lead-field"><label for="crm-notes">הערות</label><textarea id="crm-notes" name="notes" placeholder="ספרו בקצרה מה אתם צריכים"></textarea></div>' +
          '<div class="crm-lead-checkboxes">' +
            '<label class="crm-lead-checkbox"><input type="checkbox" name="marketingConsent"><span>אני מסכים/ת לקבלת עדכונים ומבצעים בדוא"ל</span></label>' +
            '<label class="crm-lead-checkbox"><input type="checkbox" name="termsAccepted"><span>קראתי ואני מסכים/ת ל<a href="/terms.html" target="_blank">תקנון האתר</a> ול<a href="/privacy-policy.html" target="_blank">מדיניות הפרטיות</a></span></label>' +
          '</div>' +
          '<div class="crm-lead-actions"><button class="crm-submit" type="submit">שליחת פנייה</button></div>' +
          '<p class="crm-lead-status" aria-live="polite"></p>' +
        '</form>' +
      '</div>';

    section.querySelector('[name="service"]').value = service;
    section.querySelector('form').addEventListener('submit', submitLead);
    return section;
  }

  async function submitLead(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var status = form.querySelector('.crm-lead-status');
    var submit = form.querySelector('.crm-submit');
    var data = Object.fromEntries(new FormData(form).entries());
    data.source = document.title || window.location.pathname;

    if (!data.name || !data.phone) {
      status.dataset.state = 'error';
      status.textContent = 'נא למלא שם וטלפון.';
      return;
    }

    if (!form.querySelector('[name="termsAccepted"]').checked) {
      status.dataset.state = 'error';
      status.textContent = 'יש לאשר את תקנון האתר ומדיניות הפרטיות כדי להמשיך.';
      return;
    }

    submit.disabled = true;
    status.dataset.state = '';
    status.textContent = 'שולח...';

    try {
      var response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Lead request failed');
      form.reset();
      form.querySelector('[name="service"]').value = pageService();
      status.dataset.state = 'success';
      status.textContent = 'הפנייה נשלחה בהצלחה. נחזור אליכם בהקדם האפשרי.';
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = 'לא הצלחנו לשלוח כרגע. נסו שוב בעוד מספר דקות.';
    } finally {
      submit.disabled = false;
    }
  }

  function mountForm() {
    if (document.getElementById('lead-form')) return;
    var footer = document.querySelector('footer');
    var form = createForm();
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(form, footer);
    } else {
      document.body.appendChild(form);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    addStyles();
    enhanceWhatsAppLinks();
    mountForm();
  });
})();
