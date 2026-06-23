const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('<section id="kumpirler"');
console.log(html.substring(start, start + 1500));
