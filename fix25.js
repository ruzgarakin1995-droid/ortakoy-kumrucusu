const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The titles currently look like this:
// <h2 class="banner-title shimmer-heading">👨‍🍳 Şefin Elinden</h2>
// We want to remove shimmer-heading from h2, and wrap the text part in it.

// First, revert the previous addition of shimmer-heading to the h2
html = html.replace(/<h2 class="banner-title shimmer-heading">/g, '<h2 class="banner-title">');

// Now, we find <h2 class="banner-title"> (Emoji) (Text) </h2>
// Emojis can be varied. Let's just match the first non-word character sequence that looks like an emoji + space.
html = html.replace(/<h2 class="banner-title">([^<a-zA-Z0-9]*?)\s*([a-zA-Z0-9ğüşöçıİĞÜŞÖÇ\s]+)<\/h2>/g, (match, emoji, text) => {
    return \`<h2 class="banner-title">\${emoji} <span class="shimmer-heading">\${text}</span></h2>\`;
});

// Write HTML back
fs.writeFileSync('index.html', html);


// 2. CSS updates
let css = fs.readFileSync('css/style.css', 'utf8');

// Add border to .banner-card
if (!css.includes('border: 1px solid rgba(255, 215, 0, 0.7)')) {
    css += \`
/* GOLD BORDER FOR BANNER CARD */
.banner-card {
    border: 1px solid rgba(255, 215, 0, 0.7) !important;
}
\`;
    fs.writeFileSync('css/style.css', css);
}

console.log('Fixed emoji animation and added gold border!');
