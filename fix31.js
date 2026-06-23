const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// I will look for all <div class="category-featured">
// And specifically find <div class="ingredient-icons"> inside it
// and make sure it is closed before <div class="category-footer">

html = html.replace(/(<div class="ingredient-icons">[\s\S]*?)(\s*<div class="category-footer">)/g, (match, icons, footer) => {
    // We just want to make sure there is a </div> immediately before the footer that closes the ingredient-icons.
    // If it's currently: <div class="ing-icon ...">...</div> \n <div class="category-footer">
    // It needs another </div>!
    
    // Let's count the number of <div and </div in `icons`.
    const divCount = (icons.match(/<div\b/g) || []).length;
    const closeCount = (icons.match(/<\/div>/g) || []).length;
    
    let result = icons;
    for (let i = 0; i < divCount - closeCount; i++) {
        result += '\n                    </div>';
    }
    
    return result + footer;
});

// Write the fix back
fs.writeFileSync('index.html', html);
console.log('Fixed div closures');
