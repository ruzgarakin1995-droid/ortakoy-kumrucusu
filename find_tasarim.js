const fs = require('fs');
const lines = fs.readFileSync('c:/Users/egem2/Desktop/cati-ocakbasi/app/admin/page.js', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('tasarim') || l.toLowerCase().includes('tasarım') || l.toLowerCase().includes('designtab')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});
