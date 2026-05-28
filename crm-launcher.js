(function () {
  var STORAGE_KEY = 'gudauri-crm-url';

  function isValidAirtableUrl(value) {
    try {
      var url = new URL(value);
      return url.protocol === 'https:' && url.hostname.indexOf('airtable.com') !== -1;
    } catch (error) {
      return false;
    }
  }

  function setStatus(message, state) {
    var status = document.getElementById('crm-status');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state || '';
  }

  function setOpenLink(value) {
    var openLink = document.getElementById('open-crm');
    if (!openLink) return;
    openLink.href = value || 'https://airtable.com/';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('crm-link-form');
    var input = document.getElementById('crm-url');
    var clear = document.getElementById('clear-crm');
    var saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      input.value = saved;
      setOpenLink(saved);
      setStatus('הקישור שמור. אפשר לפתוח את מערכת ה-CRM.', 'success');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();

      if (!isValidAirtableUrl(value)) {
        setStatus('נא להדביק קישור תקין שמתחיל ב-https://airtable.com', 'error');
        return;
      }

      localStorage.setItem(STORAGE_KEY, value);
      setOpenLink(value);
      setStatus('הקישור נשמר בדפדפן הזה.', 'success');
    });

    clear.addEventListener('click', function () {
      localStorage.removeItem(STORAGE_KEY);
      input.value = '';
      setOpenLink('');
      setStatus('הקישור אופס. אפשר להדביק קישור חדש.', '');
    });
  });
})();
