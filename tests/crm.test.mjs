import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import test from 'node:test';

import { buildAirtableFields, handler, validateLead } from '../api/leads.js';

const root = fileURLToPath(new URL('..', import.meta.url));

function listFiles(directory, predicate) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath, predicate);
    return predicate(fullPath) ? [fullPath] : [];
  });
}

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end(payload) {
      this.body = payload;
      return this;
    }
  };
}

test('validateLead rejects missing name and phone', () => {
  const result = validateLead({ service: 'apartments' });

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ['name is required', 'phone is required']);
});

test('buildAirtableFields maps a website lead to the CRM schema', () => {
  const fields = buildAirtableFields({
    name: 'Test Lead',
    phone: '+972501234567',
    service: 'apartments',
    source: 'index hero',
    notes: 'Needs a 2 bedroom apartment',
    followUpDate: '2026-06-01',
    estimatedValue: '1200'
  });

  assert.equal(fields['שם'], 'Test Lead');
  assert.equal(fields['טלפון'], '+972501234567');
  assert.equal(fields['שירות'], 'הזמנת דירות');
  assert.equal(fields['מקור'], 'index hero');
  assert.equal(fields['סטטוס'], 'חדש');
  assert.equal(fields['הערות'], 'Needs a 2 bedroom apartment');
  assert.equal(fields['תאריך חזרה'], '2026-06-01');
  assert.equal(fields['שווי משוער'], 1200);
});

test('handler creates an Airtable record for a valid POST', async () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  const calls = [];

  process.env.AIRTABLE_API_KEY = 'test_key';
  process.env.AIRTABLE_BASE_ID = 'app123';
  process.env.AIRTABLE_LEADS_TABLE = 'Leads';
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 'rec123' })
    };
  };

  const res = createResponse();
  await handler({
    method: 'POST',
    body: {
      name: 'Test Lead',
      phone: '+972501234567',
      service: 'equipment',
      source: 'website form'
    }
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { ok: true, id: 'rec123' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.airtable.com/v0/app123/Leads');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test_key');

  globalThis.fetch = originalFetch;
  process.env = originalEnv;
});

test('handler rejects invalid POST without calling Airtable', async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
  };

  const res = createResponse();
  await handler({ method: 'POST', body: { name: '', phone: '' } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(called, false);
  assert.equal(res.body.ok, false);

  globalThis.fetch = originalFetch;
});

test('public pages stay Hebrew RTL', () => {
  const htmlFiles = listFiles(root, (file) => file.endsWith('.html'));

  assert.ok(htmlFiles.length > 0);
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    assert.match(html, /<html[^>]+lang="he"[^>]+dir="rtl"/, `${file} must be Hebrew RTL`);
    assert.match(html, /direction:\s*rtl/, `${file} must include RTL CSS direction`);
  }
});

test('lead capture assets are present and do not expose Airtable secrets', () => {
  const clientScriptPath = join(root, 'crm-leads.js');
  assert.equal(existsSync(clientScriptPath), true);

  const publicFiles = listFiles(root, (file) => {
    return !file.includes(`${join(root, 'api')}`) && (file.endsWith('.html') || file.endsWith('.js'));
  });

  for (const file of publicFiles) {
    if (file.endsWith('crm-leads.js')) continue;
    const content = readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /AIRTABLE_API_KEY|pat[A-Za-z0-9]{10,}/, `${file} must not expose Airtable secrets`);
  }
});

test('internal CRM launcher page is RTL and never hardcodes Airtable credentials', () => {
  const pagePath = join(root, 'crm.html');
  const scriptPath = join(root, 'crm-launcher.js');

  assert.equal(existsSync(pagePath), true);
  assert.equal(existsSync(scriptPath), true);

  const page = readFileSync(pagePath, 'utf8');
  const script = readFileSync(scriptPath, 'utf8');

  assert.match(page, /<html[^>]+lang="he"[^>]+dir="rtl"/);
  assert.match(page, /מערכת CRM/);
  assert.match(page, /crm-launcher\.js/);
  assert.doesNotMatch(page + script, /AIRTABLE_API_KEY|pat[A-Za-z0-9]{10,}/);
});
