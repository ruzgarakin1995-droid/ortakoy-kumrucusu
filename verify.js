const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
console.log(html.match(/<img src="images\/[^"]+" alt="Ekmek Arası Tavuk İncik"/g));
console.log(html.match(/<img src="images\/[^"]+" alt="Patates Kızartması"/g));
