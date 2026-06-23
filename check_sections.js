const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = html.match(/<section id="([^"]+)"/g);
console.log(matches);
