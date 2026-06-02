const fs = require('fs');
const html = fs.readFileSync('equipment.html','utf8');

const usedKeys = new Set();
const re = /data-i18n(?:-html|-placeholder)?="([^"]+)"/g;
let m;
while ((m = re.exec(html)) !== null) usedKeys.add(m[1]);

const transStart = html.indexOf('window.TRANSLATIONS = {');
const transEnd = html.indexOf('function setLanguage');
const block = html.slice(transStart, transEnd);

function countLang(key){
  const esc = key.replace(/[.*+?^${}()|[\]\]/g, '\$&');
  const r = new RegExp("'" + esc + "':", 'g');
  return (block.match(r) || []).length;
}

const missing = [];
const partial = [];
usedKeys.forEach(k => {
  const c = countLang(k);
  if (c === 0) missing.push(k);
  else if (c < 4) partial.push(k + ' (' + c + '/4)');
});

console.log('Total data-i18n keys used in markup:', usedKeys.size);
console.log('Missing entirely:', missing.length ? missing.join(', ') : 'NONE');
console.log('Not in all 4 langs:', partial.length ? partial.join(', ') : 'NONE (all good)');
