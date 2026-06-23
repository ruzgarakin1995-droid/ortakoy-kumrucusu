const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Şefin Elinden
html = html.replace(
    `alt="Şefin Elinden" class="banner-img">\n                </div>`,
    `alt="Şefin Elinden" class="banner-img">\n                </div>` // Oops, I need to replace the badges div
);

// Actually, let's target the exact item-badges blocks for each banner.
// I will just read all banner cards and replace the item-badges content based on the title.

const regex = /<div class="banner-card">([\s\S]*?)<\/div>\s*<\/div>\s*(<div class="banner-card">|<div class="slider-dots")|(<div class="banner-card">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>)/;
// Too complex, let's use string split or simpler regex.

const cards = [
    {
        title: 'Şefin Elinden',
        badges: `<div class="item-badges">\n                    <span class="tag-badge tag-pop" style="font-size:12px; padding:6px 12px;"><i class="fa-solid fa-star"></i> Popüler</span>\n                    <span class="tag-badge tag-veg" style="font-size:12px; padding:6px 12px; margin-left: 6px;"><i class="fa-solid fa-leaf"></i> Glutensiz</span>\n                </div>`
    },
    {
        title: 'Tatlı Şöleni',
        badges: `<div class="item-badges">\n                    <span class="tag-badge tag-pop" style="font-size:12px; padding:6px 12px;"><i class="fa-solid fa-star"></i> Popüler</span>\n                    <span class="tag-badge" style="font-size:12px; padding:6px 12px; margin-left: 6px; background:#e91e63; color:white;"><i class="fa-solid fa-wheat-awn"></i> Gluten İçerir</span>\n                </div>`
    },
    {
        title: 'Gecelerin Vazgeçilmezi',
        badges: `<div class="item-badges">\n                    <span class="tag-badge tag-pop" style="font-size:12px; padding:6px 12px;"><i class="fa-solid fa-star"></i> Popüler</span>\n                    <span class="tag-badge" style="font-size:12px; padding:6px 12px; margin-left: 6px; background:#e91e63; color:white;"><i class="fa-solid fa-wheat-awn"></i> Gluten İçerir</span>\n                </div>`
    },
    {
        title: 'Sabahın Güneşi',
        badges: `<div class="item-badges">\n                    <span class="tag-badge tag-pop" style="font-size:12px; padding:6px 12px;"><i class="fa-solid fa-star"></i> Popüler</span>\n                    <span class="tag-badge" style="font-size:12px; padding:6px 12px; margin-left: 6px; background:#e91e63; color:white;"><i class="fa-solid fa-wheat-awn"></i> Gluten İçerir</span>\n                </div>`
    }
];

cards.forEach(card => {
    // Find the banner-card that contains the title
    const searchStr = `<h2 class="banner-title">${card.title}</h2>`;
    const startIndex = html.indexOf(searchStr);
    if (startIndex !== -1) {
        // Backtrack to find the <div class="item-badges"> for this specific card
        const cardStart = html.lastIndexOf('<div class="banner-card">', startIndex);
        if (cardStart !== -1) {
            const badgesStart = html.indexOf('<div class="item-badges">', cardStart);
            const badgesEnd = html.indexOf('</div>', badgesStart) + 6; // '</div>'.length = 6
            
            const oldBadges = html.substring(badgesStart, badgesEnd);
            html = html.replace(oldBadges, card.badges);
        }
    }
});

fs.writeFileSync('index.html', html);
console.log('Badges added');
