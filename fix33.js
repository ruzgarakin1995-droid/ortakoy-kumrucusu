const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The issue is exactly this string:
// <div class="ing-icon ing-dana" tabindex="0" title="Et Ürünleri"><i class="fa-solid fa-cow"></i></div>
//                     <div class="category-footer">
// But the icons vary.
// All of them have a </div> right before <div class="category-footer">
// We just need to replace `</div>\s*<div class="category-footer">` with `</div>\n                    </div>\n                    <div class="category-footer">`

html = html.replace(/<\/div>\s*<div class="category-footer">/g, '</div>\n                    </div>\n                    <div class="category-footer">');

fs.writeFileSync('index.html', html);
console.log('Done replacement');
