const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

function getIconsHtml(text) {
    let icons = [];
    const t = text.toLowerCase();
    
    if (t.includes('tost') || t.includes('ekmek') || t.includes('kumru') || t.includes('waffle') || t.includes('lavaş') || t.includes('dürüm') || t.includes('burger') || t.includes('pide') || t.includes('tahıl') || t.includes('sandviç') || t.includes('patso')) {
        icons.push('<div class="ing-icon ing-tahil" tabindex="0" title="Tahıl / Gluten"><i class="fa-solid fa-wheat-awn"></i></div>');
    }
    
    if (t.includes('kaşar') || t.includes('peynir') || t.includes('tereyağı') || t.includes('ayran') || t.includes('süt') || t.includes('çikolata')) {
        icons.push('<div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü"><i class="fa-solid fa-bottle-droplet"></i></div>');
    }
    
    if (t.includes('sosis') || t.includes('sucuk') || t.includes('salam') || t.includes('köfte') || t.includes('incik') || t.includes('kavurma') || t.includes('pastırma') || t.includes('et') || t.includes('biftek') || t.includes('adana')) {
        icons.push('<div class="ing-icon ing-dana" tabindex="0" title="Et Ürünleri"><i class="fa-solid fa-cow"></i></div>');
    }
    
    if (icons.length > 0) {
        return '\n                    <div class="ingredient-icons">\n                        ' + icons.join('\n                        ') + '\n                    </div>';
    }
    return '';
}

function makeItem(title, desc, price, img) {
    return `
            <div class="list-item">
                <div class="list-item-thumb"><img src="images/${img}" alt="${title}"></div>
                <div class="list-item-content">
                    <div class="list-item-info">
                        <h3>${title}</h3>
                        <p class="item-ingredients">${desc}</p>
                        ${getIconsHtml(desc)}
                    </div>
                    <div class="list-item-bottom">
                        <div class="list-item-price">${price}</div>
                        <button class="btn-add-small"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>`;
}

const combosHtml = 
    makeItem('İzmir Kumru Menü (Ayran)', 'İzmir Kumru + Patates Tava + Ayran', '300 ₺', 'kumru.png') +
    makeItem('İzmir Kumru Menü (Kola)', 'İzmir Kumru + Patates Tava + Kola', '330 ₺', 'kumru.png') +
    makeItem('Ayvalık Tostu Menü (Ayran)', 'Ayvalık Tostu + Patates Tava + Ayran', '300 ₺', 'tost.png') +
    makeItem('Ayvalık Tostu Menü (Kola)', 'Ayvalık Tostu + Patates Tava + Kola', '330 ₺', 'tost.png') +
    makeItem('Hamburger Menü (Ayran)', 'Hamburger + Patates Tava + Ayran', '300 ₺', 'burger.png') +
    makeItem('Hamburger Menü (Kola)', 'Hamburger + Patates Tava + Kola', '330 ₺', 'burger.png') +
    makeItem('Ekmek Arası İncik Menü (Ayran)', 'Ekmek Arası İncik + Patates Tava + Ayran', '290 ₺', 'durum.png') +
    makeItem('Ekmek Arası İncik Menü (Kola)', 'Ekmek Arası İncik + Patates Tava + Kola', '320 ₺', 'durum.png') +
    makeItem('Dürüm İncik Menü (Ayran)', 'Dürüm İncik + Patates Tava + Ayran', '300 ₺', 'durum.png') +
    makeItem('Dürüm İncik Menü (Kola)', 'Dürüm İncik + Patates Tava + Kola', '320 ₺', 'durum.png');

if (!html.includes('İzmir Kumru Menü (Ayran)')) {
    html = html.replace(/(<h3 class="card-title">☀️ Sabahın Güneşi<\/h3>[\s\S]*?<button class="btn-add"><i class="fa-solid fa-plus"><\/i><\/button>\s*<\/div>\s*<\/div>\s*<\/div>)/, '$1\n' + combosHtml);
    fs.writeFileSync('index.html', html);
    console.log('Combos appended correctly!');
} else {
    console.log('Combos already exist!');
}
