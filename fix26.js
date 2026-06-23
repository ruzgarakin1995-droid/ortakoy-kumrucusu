const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// First, revert the previous addition of shimmer-heading to the h2
html = html.replace(/<h2 class="banner-title shimmer-heading">/g, '<h2 class="banner-title">');

// Now, wrap the text part in it using standard quotes
html = html.replace(/<h2 class="banner-title">([^<a-zA-Z0-9]*?)\s*([a-zA-Z0-9ğüşöçıİĞÜŞÖÇ\s]+)<\/h2>/g, function(match, emoji, text) {
    return '<h2 class="banner-title">' + emoji + ' <span class="shimmer-heading">' + text + '</span></h2>';
});

fs.writeFileSync('index.html', html);

// 2. CSS updates
let css = fs.readFileSync('css/style.css', 'utf8');

// Add border to .banner-card
if (!css.includes('border: 1px solid rgba(255, 215, 0, 0.7)')) {
    css += '\n/* GOLD BORDER FOR BANNER CARD */\n.banner-card {\n    border: 1px solid rgba(255, 215, 0, 0.7) !important;\n}\n';
    fs.writeFileSync('css/style.css', css);
}

console.log('Fixed emoji animation and added gold border!');
