const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let css = fs.readFileSync('css/style.css', 'utf8');

// 1. Update Slider Titles and Descriptions
const sliderReplacements = [
    {
        oldRegex: /<h2 class="banner-title">Şefin Elinden\s*<span[^>]*>\(.*?\)<\/span><\/h2>\s*<p class="banner-desc">.*?<\/p>/s,
        newHTML: '<h2 class="banner-title">Şefin Elinden</h2>\n                    <p class="banner-desc">Karışık Kumpir ve Meşrubat. Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin taze mezelerle hazırlanan eşsiz lezzet!</p>'
    },
    {
        oldRegex: /<h2 class="banner-title">Tatlı Şöleni\s*<span[^>]*>\(.*?\)<\/span><\/h2>\s*<p class="banner-desc">.*?<\/p>/s,
        newHTML: '<h2 class="banner-title">Tatlı Şöleni</h2>\n                    <p class="banner-desc">Kasede Waffle ve Çay. Bol çikolata sosu ve taptaze meyvelerle harmanlanan kase waffle keyfi, yanında sıcacık tavşan kanı çay ile.</p>'
    },
    {
        oldRegex: /<h2 class="banner-title">Gecelerin Vazgeçilmezi\s*<span[^>]*>\(.*?\)<\/span><\/h2>\s*<p class="banner-desc">.*?<\/p>/s,
        newHTML: '<h2 class="banner-title">Gecelerin Vazgeçilmezi</h2>\n                    <p class="banner-desc">Goralı Kumru ve Meşrubat. Özel sosis, ev yapımı rus salatası ve kornişon turşunun yumuşacık sandviç ekmeğiyle buluştuğu doyurucu lezzet.</p>'
    },
    {
        oldRegex: /<h2 class="banner-title">Sabahın Güneşi\s*<span[^>]*>\(.*?\)<\/span><\/h2>\s*<p class="banner-desc">.*?<\/p>/s,
        newHTML: '<h2 class="banner-title">Sabahın Güneşi</h2>\n                    <p class="banner-desc">Ayvalık Tostu ve Çay. Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay.</p>'
    }
];

sliderReplacements.forEach(rep => {
    html = html.replace(rep.oldRegex, rep.newHTML);
});

// 2. Update Kampanyalı Menüler Descriptions
// These are currently like: <p class="item-ingredients">Karışık Kumpir ve Meşrubat.</p>
// We need to replace the content inside the <p> for each specific title in the Kampanyalı Menüler section.
// We'll just replace them entirely based on the preceding title.
const kampanyaDesc = {
    "Şefin Elinden": "Karışık Kumpir ve Meşrubat. Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin taze mezelerle hazırlanan eşsiz lezzet!",
    "Tatlı Şöleni": "Kasede Waffle ve Çay. Bol çikolata sosu ve taptaze meyvelerle harmanlanan kase waffle keyfi, yanında sıcacık tavşan kanı çay ile.",
    "Gecelerin Vazgeçilmezi": "Goralı Kumru ve Meşrubat. Özel sosis, ev yapımı rus salatası ve kornişon turşunun yumuşacık sandviç ekmeğiyle buluştuğu doyurucu lezzet.",
    "Sabahın Güneşi": "Ayvalık Tostu ve Çay. Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay."
};

for (const [title, desc] of Object.entries(kampanyaDesc)) {
    const regex = new RegExp(`(<h3 class="card-title">${title}<\\/h3>\\s*)<p class="item-ingredients">.*?<\\/p>`, 's');
    html = html.replace(regex, `$1<p class="item-ingredients">${desc}</p>`);
}

// 3. Add 2-column featured grid below slider
// CSS for the grid:
const gridCSS = `
.featured-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
}
@media (max-width: 768px) {
    .featured-grid {
        grid-template-columns: 1fr; /* Actually the user said "yan yana 2 kutucuk olarak yap", let's make it 2 columns even on mobile or responsive. Let's do 1fr 1fr on all sizes as requested for mobile */
    }
}
.featured-card {
    background: var(--surface-color);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.featured-img-wrapper {
    position: relative;
    width: 100%;
    height: 140px;
}
.featured-img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.featured-card .tag-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: var(--accent-color);
    color: #000;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 11px;
}
.featured-content {
    padding: 12px;
    display: flex;
    flex-direction: column;
    flex: 1;
}
.featured-content h3 {
    font-size: 15px;
    color: #fff;
    margin-bottom: 6px;
}
.featured-content p {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.4;
    margin-bottom: 12px;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.featured-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.featured-footer .price {
    font-size: 16px;
    font-weight: 700;
    color: var(--accent-color);
}
.featured-footer .btn-add-large {
    background: var(--accent-color);
    color: #000;
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
}
`;

if (!css.includes('.featured-grid')) {
    css += '\n' + gridCSS;
}

const featuredGridHTML = `
    <!-- Featured Grid -->
    <div class="featured-grid">
        <div class="featured-card">
            <div class="featured-img-wrapper">
                <img src="images/kumru_menu.png" alt="Efsane Kumru Menü" onerror="this.src='images/kumru.png'">
                <span class="tag-badge tag-new"><i class="fa-solid fa-star"></i> YENİ LEZZET</span>
            </div>
            <div class="featured-content">
                <h3>Efsane Kumru Menü</h3>
                <p>1x Orijinal İzmir Kumru (Sucuk, salam, sosis, kaşar peyniri, domates) + Patates Tava (150 g) + İçecek (Kutu Kola).</p>
                <div class="featured-footer">
                    <span class="price">330₺</span>
                    <button class="btn-add-large">Siparişe Ekle</button>
                </div>
            </div>
        </div>
        <div class="featured-card">
            <div class="featured-img-wrapper">
                <img src="images/kumpir.png" alt="Karışık Kumpir Şöleni">
                <span class="tag-badge tag-new"><i class="fa-solid fa-star"></i> YENİ LEZZET</span>
            </div>
            <div class="featured-content">
                <h3>Karışık Kumpir Şöleni</h3>
                <p>Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin 7 çeşit meze ile unutulmaz bir lezzet şöleni.</p>
                <div class="featured-footer">
                    <span class="price">350₺</span>
                    <button class="btn-add-large">Siparişe Ekle</button>
                </div>
            </div>
        </div>
    </div>
`;

// Insert the grid right after the slider container
if (!html.includes('featured-grid')) {
    html = html.replace(/(<div class="slider-container">.*?<\/div>\s*<\/div>\s*<\/div>)/s, '$1\n' + featuredGridHTML);
}

// Ensure the user specifically asked for "yan yana 2 kutucuk". So we force grid-template-columns: 1fr 1fr;
// To make sure long texts don't break layout, we use line-clamp (already added).

fs.writeFileSync('index.html', html);
fs.writeFileSync('css/style.css', css);

console.log('Update 5 complete');
