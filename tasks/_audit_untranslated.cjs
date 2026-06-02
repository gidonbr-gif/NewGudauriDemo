// Find VISIBLE Hebrew text that has no data-i18n on its wrapping element.
// Such text stays Hebrew in every language => "unclear in other languages".
// Approximate: strips <script>/<style>, walks tags as a stack, and for each
// Hebrew text node checks whether the nearest open tag carried a data-i18n attr.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['equipment.html', 'index.html', 'investors.html', 'lina.html', 'new-gudauri-info.html'];
const HEB = /[֐-׿]/;

// tags whose text is not user-facing / safe to ignore
const IGNORE_TAGS = new Set(['script', 'style', 'svg', 'path', 'title', 'option']);

for (const file of FILES) {
  let html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  // remove script & style contents entirely
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
             .replace(/<style[\s\S]*?<\/style>/gi, '');

  const tokenRe = /<\/?([a-zA-Z0-9]+)([^>]*?)\/?>|([^<]+)/g;
  const stack = [];      // {tag, hasI18n}
  const findings = [];
  let m;
  while ((m = tokenRe.exec(html)) !== null) {
    if (m[1] !== undefined) {
      // a tag
      const raw = m[0];
      const tag = m[1].toLowerCase();
      const attrs = m[2] || '';
      const isClose = raw.startsWith('</');
      const selfClose = raw.endsWith('/>') || /^(img|br|hr|input|meta|link|source)$/.test(tag);
      if (isClose) {
        // pop to matching tag
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i].tag === tag) { stack.length = i; break; }
        }
      } else if (!selfClose) {
        stack.push({ tag, hasI18n: /data-i18n/.test(attrs) });
      }
    } else if (m[3] !== undefined) {
      const text = m[3].replace(/\s+/g, ' ').trim();
      if (!text || !HEB.test(text)) continue;
      const top = stack[stack.length - 1];
      if (!top) continue;
      if (IGNORE_TAGS.has(top.tag)) continue;
      // is any ancestor carrying data-i18n? (covers nested spans)
      const anyI18n = stack.some(s => s.hasI18n);
      if (!anyI18n) findings.push(`<${top.tag}> ${text.slice(0, 70)}`);
    }
  }

  console.log(`\n### ${file} — ${findings.length} untranslated Hebrew text node(s)`);
  findings.slice(0, 60).forEach(f => console.log('  ' + f));
}
