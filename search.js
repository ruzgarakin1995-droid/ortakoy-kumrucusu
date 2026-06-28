const fs = require('fs');

const code = fs.readFileSync('c:/Users/egem2/Desktop/cati-ocakbasi/app/page.js', 'utf8');
const lines = code.split('\n');

const results = [];
lines.forEach((l, i) => {
  const line = l.toLowerCase();
  if (line.includes('toast') || line.includes('color') || line.includes('glass')) {
    results.push(`${i+1}: ${l.trim()}`);
  }
});

fs.writeFileSync('c:/Users/egem2/Desktop/ortakoy-kumrucusu/features_lines.txt', results.join('\n'));

const cssCode = fs.readFileSync('c:/Users/egem2/Desktop/cati-ocakbasi/app/globals.css', 'utf8');
const cssLines = cssCode.split('\n');

const cssResults = [];
cssLines.forEach((l, i) => {
  const line = l.toLowerCase();
  if (line.includes('toast') || line.includes('color') || line.includes('glass')) {
    cssResults.push(`${i+1}: ${l.trim()}`);
  }
});

fs.writeFileSync('c:/Users/egem2/Desktop/ortakoy-kumrucusu/features_css_lines.txt', cssResults.join('\n'));
