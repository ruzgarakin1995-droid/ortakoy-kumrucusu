const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove all old allergen-icons and ingredient-icons completely
html = html.replace(/<div class="allergen-icons">[\s\S]*?<\/div>/g, '');
html = html.replace(/<div class="ingredient-icons">[\s\S]*?<\/div>\s*/g, '');

function getIconsHtml(text) {
    let icons = [];
    const t = text.toLowerCase();
    
    // Tahıl (Gluten)
    if (t.includes('tost') || t.includes('ekmek') || t.includes('kumru') || t.includes('waffle') || t.includes('lavaş') || t.includes('dürüm') || t.includes('burger') || t.includes('pide') || t.includes('tahıl') || t.includes('sandviç') || t.includes('patso')) {
        icons.push('<div class="ing-icon ing-tahil" tabindex="0" title="Tahıl / Gluten"><i class="fa-solid fa-wheat-awn"></i></div>');
    }
    
    // Süt (Süt Ürünleri)
    if (t.includes('kaşar') || t.includes('peynir') || t.includes('tereyağı') || t.includes('ayran') || t.includes('süt') || t.includes('çikolata')) {
        icons.push('<div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü"><i class="fa-solid fa-bottle-droplet"></i></div>');
    }
    
    // Et Ürünleri (Dana vs)
    if (t.includes('sosis') || t.includes('sucuk') || t.includes('salam') || t.includes('köfte') || t.includes('incik') || t.includes('kavurma') || t.includes('pastırma') || t.includes('et') || t.includes('biftek')) {
        icons.push('<div class="ing-icon ing-dana" tabindex="0" title="Et Ürünleri"><i class="fa-solid fa-cow"></i></div>');
    }
    
    // Tavuk removed as requested!

    if (icons.length > 0) {
        return '\n                    <div class="ingredient-icons">\n                        ' + icons.join('\n                        ') + '\n                    </div>';
    }
    return '';
}

// 2. Fix banner items
html = html.replace(/<p class="banner-desc">([\s\S]*?)<\/p>[\s\S]*?<div class="banner-footer"/g, (match, p1) => {
    const icons = getIconsHtml(p1);
    return '<p class="banner-desc">' + p1 + '</p>' + icons + '\n                    <div class="banner-footer"';
});

// 3. Fix list items
html = html.replace(/<p class="item-ingredients">([\s\S]*?)<\/p>[\s\S]*?<div class="card-footer"/g, (match, p1) => {
    // some list items don't have card-footer, they have list-item-bottom
    // wait! list-items have list-item-bottom!
    // let's check index.html for list items
    return match; // fallback
});

// For list items with list-item-bottom:
html = html.replace(/<p class="item-ingredients">([\s\S]*?)<\/p>[\s\S]*?<\/div><div class="list-item-bottom">/g, (match, p1) => {
    const icons = getIconsHtml(p1);
    return '<p class="item-ingredients">' + p1 + '</p>' + icons + '</div><div class="list-item-bottom">';
});

// For list items inside card-content (if any):
html = html.replace(/<p class="item-ingredients">([\s\S]*?)<\/p>[\s\S]*?<div class="card-footer"/g, (match, p1) => {
    const icons = getIconsHtml(p1);
    return '<p class="item-ingredients">' + p1 + '</p>' + icons + '\n                    <div class="card-footer"';
});

// 4. Fix featured items
html = html.replace(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>[\s\S]*?<div class="featured-footer"/g, (match, p1, p2) => {
    const icons = getIconsHtml(p1 + " " + p2);
    return '<h3>' + p1 + '</h3>\n                <p>' + p2 + '</p>' + icons + '\n                <div class="featured-footer"';
});

fs.writeFileSync('index.html', html);
console.log('Fixed duplicate icons and updated text logic');
