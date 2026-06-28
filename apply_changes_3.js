const fs = require('fs');
const filePath = 'c:/Users/egem2/Desktop/ortakoy-kumrucusu/app/globals.css';
let code = fs.readFileSync(filePath, 'utf8');

const newBody = `body {
  background-color: var(--bg-color);
  background-image: var(--theme-bg-pattern, none);
  background-attachment: fixed;
  color: var(--text-main);
  line-height: 1.5;
  padding-bottom: 80px; /* Space for scroll */
}`;

code = code.replace(/body\s*\{[^}]+\}/, newBody);
fs.writeFileSync(filePath, code);
console.log('globals.css updated.');
