import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('..', import.meta.url));

// Evaluate the widget in a sandbox: readyState 'loading' + noop listeners keep
// init() from running, so only the public matcher API is exposed.
function loadMatcher() {
  const src = readFileSync(new URL('../gudauri-chat.js', import.meta.url), 'utf8');
  const sandbox = {
    window: {},
    document: { readyState: 'loading', addEventListener: () => {} },
    localStorage: { getItem: () => 'he', setItem: () => {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.GudauriChat.match;
}

const match = loadMatcher();
const topic = (q) => { const t = match(q); return t ? t.id : null; };

test('matcher answers common Hebrew questions (short keywords count as whole words)', () => {
  assert.equal(topic('יש דירה פנויה?'), 'apartments');
  assert.equal(topic('כמה עולה ציוד'), 'equipment');
  assert.equal(topic('מה המחיר ללילה בדירות'), 'apartments');
  assert.equal(topic('איך מגיעים לגודאורי'), 'transfer');
  assert.equal(topic('יש בריכה?'), 'pool-spa');
  assert.equal(topic('מתי מתחילה העונה'), 'season');
  assert.equal(topic('איך יוצרים קשר'), 'contact');
  assert.equal(topic('תודה רבה!'), 'thanks');
});

test('matcher answers English, Russian and Georgian questions', () => {
  assert.equal(topic('do you have apartments available'), 'apartments');
  assert.equal(topic('how do I get there from tbilisi'), 'transfer');
  assert.equal(topic('what rental income can I expect'), 'yield');
  assert.equal(topic('сколько стоит прокат'), 'equipment');
  assert.equal(topic('оплата картой возможна?'), 'booking');
  assert.equal(topic('რა ღირს აღჭურვილობა'), 'equipment');
});

test('greetings and exact single-word messages match', () => {
  assert.equal(topic('hi'), 'greeting');
  assert.equal(topic('привет'), 'greeting');
  assert.equal(topic('שלום'), 'greeting');
  assert.equal(topic('ski'), 'equipment');
});

test('unknown questions fall through to the WhatsApp handoff (null)', () => {
  assert.equal(topic('asdkjhaskjd qwerty'), null);
  assert.equal(topic('מה הלוח זמנים של האוטובוס בפריז'), null);
});

test('chat widget is included on every main public page', () => {
  for (const page of ['index.html', 'lina.html', 'equipment.html', 'investors.html', 'new-gudauri-info.html']) {
    const html = readFileSync(root + page, 'utf8');
    assert.match(html, /<script src="gudauri-chat\.js" defer><\/script>/, `${page} is missing the chat widget`);
  }
});
