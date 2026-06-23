const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The starting point is the end of featured-grid
// We know featured-grid ends with:
//                 <button class="btn-add-large">Siparişe Ekle</button>
//             </div>
//         </div>
//     </div>

// We need to remove everything after this </div> down to <section id="kampanyali" class="menu-section">

const regex = /(<div class="featured-grid">.*?<\/div>\s*<\/div>\s*<\/div>)\s*<div class="banner-card">.*?<section id="kampanyali" class="menu-section">/s;

html = html.replace(regex, '$1\n\n    <section id="kampanyali" class="menu-section">');

// Just in case it wasn't a banner-card right after it
const regexFallback = /(<!-- Featured Grid -->.*?<div class="featured-grid">.*?<\/div>\s*<\/div>\s*<\/div>).*?(<section id="kampanyali" class="menu-section">)/s;

html = html.replace(regexFallback, '$1\n\n    $2');

fs.writeFileSync('index.html', html);
console.log('Orphaned slider elements removed.');
