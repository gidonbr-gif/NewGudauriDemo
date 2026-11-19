import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

import handler from '../api/equipment-payment.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => readFileSync(root + file, 'utf8');

const PAGES = ['index.html', 'lina.html', 'equipment.html', 'investors.html', 'new-gudauri-info.html'];
const GEL_TO_ILS = 1.35;

// The price list lives twice: in the page (estimate shown to the visitor) and in
// the API (deposit actually charged). Read both object literals as written.
function pricesFrom(source, label) {
  const found = source.match(/const PRICES = (\{[\s\S]*?\n\s*\});/);
  assert.ok(found, `PRICES not found in ${label}`);
  return vm.runInNewContext(`(${found[1]})`);
}

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    setHeader() { return this; },
    json(payload) { this.body = payload; return this; },
    end() { return this; }
  };
}

// Runs the deposit handler with Cardcom stubbed out; returns what would have been charged.
async function requestDeposit(order) {
  const realFetch = globalThis.fetch;
  let sent = null;
  globalThis.fetch = async (_url, options) => {
    sent = JSON.parse(options.body);
    return { json: async () => ({ ResponseCode: 0, Url: 'https://example.test/pay' }) };
  };
  try {
    const res = createResponse();
    await handler({ method: 'POST', headers: {}, body: { name: 'Test', phone: '050', ...order } }, res);
    return { status: res.statusCode, body: res.body, sent };
  } finally {
    globalThis.fetch = realFetch;
  }
}

test('equipment page and deposit API use the same Ski Boom price list', () => {
  const page = pricesFrom(read('equipment.html'), 'equipment.html');
  const api = pricesFrom(read('api/equipment-payment.js'), 'api/equipment-payment.js');

  assert.deepEqual(JSON.parse(JSON.stringify(page)), JSON.parse(JSON.stringify(api)));
  assert.match(read('equipment.html'), /const GEL_TO_ILS = 1\.35;/);
  assert.match(read('api/equipment-payment.js'), /GEL_ILS_RATE \|\| '1\.35'/);
});

test('every lari price on the equipment page shows its shekel estimate', () => {
  const html = read('equipment.html');
  const priced = [...html.matchAll(/data-gel="(\d+)"[^\n]*?₾(\d+)[^\n]*?≈ ₪(\d+)/g)];

  assert.ok(priced.length >= 20, `expected the full price list, found ${priced.length} prices`);
  for (const [, gel, shownGel, shownIls] of priced) {
    assert.equal(shownGel, gel, `₾${shownGel} is displayed for data-gel="${gel}"`);
    assert.equal(Number(shownIls), Math.round(Number(gel) * GEL_TO_ILS), `wrong ₪ estimate for ₾${gel}`);
  }
});

test('deposit is 10% of the lari total, charged in shekels', async () => {
  delete process.env.GEL_ILS_RATE;

  // Basic ski set 50 + helmet 10 + goggles 10 = ₾70/day × 3 days = ₾210 → 10% = ₾21 → ₪28.35 → ₪29
  const order = await requestDeposit({
    checkin: '2026-12-01', checkout: '2026-12-04',
    equipmentType: 'ski', equipmentLevel: 'basic', helmetSize: 'M', goggles: 'yes'
  });

  assert.equal(order.status, 200);
  assert.equal(order.body.totalGel, 210);
  assert.equal(order.body.depositIls, 29);
  assert.equal(order.sent.Amount, 29);
  assert.match(order.sent.SuccessRedirectUrl, /total=210&dep=29/);
});

test('deposit API rejects the retired beginner / intermediate / advanced levels', async () => {
  const order = await requestDeposit({
    checkin: '2026-12-01', checkout: '2026-12-04',
    equipmentType: 'ski', equipmentLevel: 'beginner'
  });

  assert.equal(order.status, 400);
  assert.equal(order.sent, null, 'nothing may be sent to Cardcom for an invalid order');
});

test('Fanatic is gone from the equipment flow', () => {
  for (const file of ['equipment.html', 'gudauri-chat.js', 'api/equipment-payment.js', 'payment-success.html']) {
    assert.doesNotMatch(read(file), /fanatic/i, `${file} still mentions Fanatic`);
  }
});

test('equipment photos referenced by the page exist', () => {
  const photos = [...read('equipment.html').matchAll(/src="(images\/equipment\/[^"]+)"/g)].map((m) => m[1]);

  assert.ok(photos.length >= 6, 'expected the gear photos on the equipment page');
  for (const photo of photos) assert.ok(existsSync(root + photo), `${photo} is missing`);
});

test('every main page keeps the language flags from being crushed', () => {
  assert.ok(existsSync(root + 'nav-fit.js'), 'nav-fit.js is missing');
  for (const page of PAGES) {
    const html = read(page);
    assert.match(html, /<script src="nav-fit\.js" defer><\/script>/, `${page} does not load nav-fit.js`);
    assert.match(html, /#nav \.lang-switcher, #nav \.lang-btn, #nav \.lang-btn img \{ flex-shrink: 0; \}/, `${page} lets the flags shrink`);
    assert.match(html, /html\.nav-compact #nav \.nav-burger \{ display: flex; \}/, `${page} has no compact fallback`);
  }
});
