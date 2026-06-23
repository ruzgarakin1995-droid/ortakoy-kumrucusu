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

// 1. ADD NEW SECTIONS
const durumlerHtml = `
        <!-- DÜRÜMLER -->
        <section id="durumler" class="menu-section">
            <h2 class="section-title"><i class="fa-solid fa-scroll"></i> Dürümler</h2>` + 
            makeItem('Adana Dürüm', 'Özel lavaş ekmeğine sarılı nefis Adana kebap, soğan, maydanoz ve domates.', '290 ₺', 'durum.png') +
            makeItem('Tavuk İncik Dürüm', 'Özel lavaş ekmeğine sarılı ızgara tavuk incik, soğan ve yeşillikler.', '250 ₺', 'durum.png') + `
        </section>
`;

const tostlarHtml = `
        <!-- TOSTLAR -->
        <section id="tostlar" class="menu-section">
            <h2 class="section-title"><i class="fa-solid fa-bread-slice"></i> Tostlar</h2>` + 
            makeItem('Ayvalık Tostu', 'Orijinal Ayvalık tostu ekmeği, kaşar, sosis, sucuk, salam, amerikan salatası, turşu.', '240 ₺', 'tost.png') +
            makeItem('Sucuklu Kaşarlı Tost', 'Tost ekmeği, bol kaşar peyniri ve özel sucuk.', '210 ₺', 'tost.png') +
            makeItem('Kaşarlı Tost', 'Tost ekmeği ve bol eritme kaşar peyniri.', '190 ₺', 'tost.png') +
            makeItem('Sucuklu Tost', 'Tost ekmeği ve özel sucuk dilimleri.', '190 ₺', 'tost.png') +
            makeItem('Ege Tostu', 'Özel Ege yöresi lezzetleriyle hazırlanan doyurucu tost.', '290 ₺', 'tost.png') + `
        </section>
`;

const porsiyonlarHtml = `
        <!-- PORSİYONLAR -->
        <section id="porsiyonlar" class="menu-section">
            <h2 class="section-title"><i class="fa-solid fa-plate-wheat"></i> Porsiyonlar</h2>` + 
            makeItem('Kasap Köfte Porsiyon', 'Özel kasap köfte, yanında patates kızartması ve yeşillik.', '380 ₺', 'burger.png') +
            makeItem('Tavuk İncik Porsiyon', 'Izgara tavuk incik, patates kızartması ve yeşillik ile.', '350 ₺', 'durum.png') + `
        </section>
`;

// Insert new sections before Kumrular
html = html.replace('<!-- 6. İZMİR KUMRU -->', durumlerHtml + tostlarHtml + porsiyonlarHtml + '\n        <!-- 6. İZMİR KUMRU -->');

// 2. KUMPİRLER UPDATES
// Karışık Kumpir 450 -> 350
html = html.replace(/<div class="list-item-price">450 ₺<\/div>(?=\s*<button class="btn-add-small"><i class="fa-solid fa-plus"><\/i><\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="list-item">\s*<div class="list-item-thumb"><img src="images\/kumpir.png" alt="Köfteli Kumpir">)/, '<div class="list-item-price">350 ₺</div>');
// Add Tavuklum Kumpir
const tavukKumpir = makeItem('Tavuklum Kumpir', 'Büyük boy fırın patates, tereyağı, kaşar ve sote tavuk parçaları.', '450 ₺', 'kumpir.png');
html = html.replace(/(<div class="list-item-info"><h3>Sade Kumpir.*?<\/div>\s*<\/div>\s*<\/div>)/, '$1\n' + tavukKumpir);

// 3. KAMPANYALI MENÜLER UPDATES
// Add the 10 combos from Image 2
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

html = html.replace(/(<h3 class="card-title">☀️ Sabahın Güneşi.*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>)/, '$1\n' + combosHtml);

// 4. İÇECEKLER UPDATES
// Bitki Çayı price 30 -> 40
html = html.replace(/(<h3>Bitki Çayı<\/h3>.*?<div class="list-item-price">)30( ₺<\/div>)/, '$140$2');
// Patates Kızartması 140 -> 140 ₺ / 190 ₺
html = html.replace(/(<h3>Patates Kızartması<\/h3>.*?<div class="list-item-price">)140 ₺(<\/div>)/, '$1140 ₺ / 190 ₺$2');
// Ekmek Arası Tavuk İncik 230 -> 230 / 280 / 330
html = html.replace(/(<h3>Ekmek Arası Tavuk İncik<\/h3>.*?<div class="list-item-price">)230 ₺(<\/div>)/, '$1230 ₺ / 280 ₺ / 330 ₺$2');
// Ekmek Arası Satır Köfte 230 -> 230 / 280 / 330
html = html.replace(/(<h3>Ekmek Arası Satır Köfte<\/h3>.*?<div class="list-item-price">)230 ₺(<\/div>)/, '$1230 ₺ / 280 ₺ / 330 ₺$2');

fs.writeFileSync('index.html', html);
console.log('Added missing items from menu!');
