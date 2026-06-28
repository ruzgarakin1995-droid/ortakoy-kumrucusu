const fs = require('fs');
const filePath = 'c:/Users/egem2/Desktop/ortakoy-kumrucusu/app/globals.css';

let css = fs.readFileSync(filePath, 'utf8');

const additionalStyles = `
/* LIGHT MODE EXTRA REFINEMENTS */
body.light-mode .search-filter-section {
  background: var(--glass-bg);
}

body.light-mode .toast-header,
body.light-mode .toast-price {
  color: var(--text-main);
}

body.light-mode .toast-close {
  color: var(--text-muted);
}

body.light-mode .toast-close:hover {
  color: var(--text-main);
}

body.light-mode .search-bar {
  background: var(--surface-color);
}
`;

if (!css.includes('LIGHT MODE EXTRA REFINEMENTS')) {
  fs.appendFileSync(filePath, '\n' + additionalStyles);
  console.log('Appended light mode extra refinements');
} else {
  console.log('Already appended');
}
