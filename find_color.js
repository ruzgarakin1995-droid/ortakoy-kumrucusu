const fs = require('fs');
const code = fs.readFileSync('c:/Users/egem2/Desktop/cati-ocakbasi/app/page.js', 'utf8');
const lines = code.split('\n');

const results = [];
lines.forEach((l, i) => {
  if (l.includes('type=\"color\"') || l.includes('themeColor')) {
    results.push(`${i+1}: ${l.trim()}`);
  }
});
fs.writeFileSync('c:/Users/egem2/Desktop/ortakoy-kumrucusu/color_picker_lines.txt', results.join('\n'));
