// Audit i18n completeness across all main pages.
// For each page: find all data-i18n* keys used in markup, then verify each
// key is defined in all 4 language blocks (he/en/ru/ge) of window.TRANSLATIONS.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['equipment.html', 'index.html', 'investors.html', 'lina.html', 'new-gudauri-info.html'];
const LANGS = ['he', 'en', 'ru', 'ge'];

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

for (const file of FILES) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) { console.log(`\n### ${file} — NOT FOUND`); continue; }
  const html = fs.readFileSync(full, 'utf8');

  // keys used in markup
  const usedKeys = new Set();
  const re = /data-i18n(?:-html|-placeholder|-aria-label|-content|-alt)?="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) usedKeys.add(m[1]);

  // translations block
  const tStart = html.indexOf('TRANSLATIONS');
  const tBlock = tStart === -1 ? '' : html.slice(tStart);

  // Determine which langs each key appears in by locating language sections.
  // Strategy: count occurrences of 'key': across whole translations block; if a key
  // is defined once per language we expect 4. Also detect per-lang presence by
  // splitting the block at language markers.
  function countOccurrences(key) {
    const r = new RegExp("['\"]" + esc(key) + "['\"]\\s*:", 'g');
    return (tBlock.match(r) || []).length;
  }

  const missing = [];
  const partial = [];
  usedKeys.forEach(k => {
    const c = countOccurrences(k);
    if (c === 0) missing.push(k);
    else if (c < LANGS.length) partial.push(`${k} (${c}/4)`);
  });

  console.log(`\n### ${file}`);
  console.log(`  keys used: ${usedKeys.size}`);
  console.log(`  MISSING entirely: ${missing.length ? missing.join(', ') : 'none'}`);
  console.log(`  PARTIAL (<4 langs): ${partial.length ? partial.join(', ') : 'none'}`);
}
