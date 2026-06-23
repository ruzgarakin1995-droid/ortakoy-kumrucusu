const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let css = fs.readFileSync('css/style.css', 'utf8');

// 1. CSS Fixes for ingredient icons
const oldCss = `
.ingredient-icons {
    display: flex;
    gap: 6px;
    margin-top: 10px;
}
.ing-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    color: white;
    font-size: 13px;
    position: relative;
}
.ing-icon:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    white-space: nowrap;
    margin-bottom: 4px;
    pointer-events: none;
}`;

const newCss = `
.ingredient-icons {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
    width: 100%;
}
.ing-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    color: white;
    font-size: 13px;
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
}
.ing-icon:hover::after, .ing-icon:active::after, .ing-icon:focus::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.9);
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    margin-bottom: 6px;
    z-index: 10;
}
.ing-icon:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
}`;

if(css.includes('.ingredient-icons')) {
    css = css.replace(oldCss, newCss);
}
fs.writeFileSync('css/style.css', css);

// 2. Titles & Emojis replacement
html = html.replace(/Sabahın Güneşi/g, '☀️ Sabahın Güneşi');
html = html.replace(/Gecelerin Vazgeçilmezi/g, '🌙 Gecelerin Vazgeçilmezi');
html = html.replace(/Tatlı Şöleni/g, '🍰 Tatlı Şöleni');
html = html.replace(/Şefin Elinden/g, '👨‍🍳 Şefin Elinden');
html = html.replace(/Efsane Kumru Menü/g, '⭐ Efsane Kumru Menü');
html = html.replace(/Karışık Kumpir Şöleni/g, '⭐ Karışık Kumpir Şöleni');

// Ensure I didn't double-emoji:
html = html.replace(/☀️ ☀️ Sabahın Güneşi/g, '☀️ Sabahın Güneşi');
html = html.replace(/🌙 🌙 Gecelerin Vazgeçilmezi/g, '🌙 Gecelerin Vazgeçilmezi');
html = html.replace(/🍰 🍰 Tatlı Şöleni/g, '🍰 Tatlı Şöleni');
html = html.replace(/👨‍🍳 👨‍🍳 Şefin Elinden/g, '👨‍🍳 Şefin Elinden');
html = html.replace(/⭐ ⭐ Efsane Kumru Menü/g, '⭐ Efsane Kumru Menü');
html = html.replace(/⭐ ⭐ Karışık Kumpir Şöleni/g, '⭐ Karışık Kumpir Şöleni');

// 3. YENİ LEZZET -> SÜPER LEZZET
html = html.replace(/YENİ LEZZET/g, 'SÜPER LEZZET');

// Safer cleanup of ingredient icons:
html = html.replace(/<div class="ingredient-icons">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, match => match.replace(/<div class="ingredient-icons">[\s\S]*?<\/div>/, ''));

function getIconsHtml(text) {
    let icons = [];
    const t = text.toLowerCase();
    
    if (t.includes('tost') || t.includes('ekmek') || t.includes('kumru') || t.includes('waffle') || t.includes('lavaş') || t.includes('dürüm') || t.includes('burger') || t.includes('pide') || t.includes('tahıl') || t.includes('sandviç') || t.includes('patso')) {
        icons.push('<div class="ing-icon ing-tahil" tabindex="0" title="Tahıl / Gluten"><i class="fa-solid fa-wheat-awn"></i></div>');
    }
    
    if (t.includes('kaşar') || t.includes('peynir') || t.includes('tereyağı') || t.includes('ayran') || t.includes('süt') || t.includes('çikolata')) {
        icons.push('<div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü"><i class="fa-solid fa-bottle-droplet"></i></div>');
    }
    
    if (t.includes('sosis') || t.includes('sucuk') || t.includes('salam') || t.includes('köfte') || t.includes('incik') || t.includes('kavurma') || t.includes('pastırma') || t.includes('et') || t.includes('biftek')) {
        icons.push('<div class="ing-icon ing-dana" tabindex="0" title="Dana Eti"><i class="fa-solid fa-cow"></i></div>');
    }
    
    if (t.includes('tavuk')) {
        icons.push('<div class="ing-icon ing-tavuk" tabindex="0" title="Tavuk Eti"><i class="fa-solid fa-kiwi-bird"></i></div>');
    }

    if (icons.length > 0) {
        return '\n                    <div class="ingredient-icons">\n                        ' + icons.join('\n                        ') + '\n                    </div>';
    }
    return '';
}

html = html.replace(/<p class="item-ingredients">([\s\S]*?)<\/p>/g, (match, p1) => {
    if (match.includes('ingredient-icons')) return match;
    const iconsHtml = getIconsHtml(p1);
    return '<p class="item-ingredients">' + p1 + '</p>' + iconsHtml;
});

html = html.replace(/<p class="banner-desc">([\s\S]*?)<\/p>/g, (match, p1) => {
    if (match.includes('ingredient-icons')) return match;
    const iconsHtml = getIconsHtml(p1);
    return '<p class="banner-desc">' + p1 + '</p>' + iconsHtml;
});

html = html.replace(/<div class="featured-content">([\s\S]*?)<p>([\s\S]*?)<\/p>/g, (match, p1, p2) => {
    if (match.includes('ingredient-icons')) return match;
    const context = p1 + " " + p2;
    const iconsHtml = getIconsHtml(context);
    return '<div class="featured-content">' + p1 + '<p>' + p2 + '</p>' + iconsHtml;
});

fs.writeFileSync('index.html', html);
console.log('Done');
