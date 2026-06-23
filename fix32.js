const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The issue is that the closing </div> for <div class="ingredient-icons"> is missing.
// It looks exactly like:
// <div class="ing-icon ing-dana" tabindex="0" title="Et Ürünleri"><i class="fa-solid fa-cow"></i></div>
//                     <div class="category-footer">
// OR something similar. We can just replace:
// </div>\s*<div class="category-footer">
// With:
// </div>\n                    </div>\n                    <div class="category-footer">
// But ONLY where it's actually missing.

html = html.replace(/<div class="ingredient-icons">([\s\S]*?)<div class="category-footer">/g, (match, inner) => {
    // Let's count divs in inner.
    // inner includes the children of ingredient-icons, but not the closing tag for ingredient-icons.
    let divs = (inner.match(/<div/g) || []).length;
    let ends = (inner.match(/<\/div>/g) || []).length;
    
    // We add 1 to divs because <div class="ingredient-icons"> is outside `inner`.
    divs += 1;
    
    let result = `<div class="ingredient-icons">${inner}`;
    while (ends < divs) {
        result += '</div>\n                    ';
        ends++;
    }
    result += '<div class="category-footer">';
    return result;
});

fs.writeFileSync('index.html', html);
console.log('Forcefully fixed div closures!');
