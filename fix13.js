const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix CSS for .section-title (the checkout modal accidentally overwrote the main page headers)
css = css.replace(
    /\.section-title \{\n    font-size: 15px;\n    margin-bottom: 12px;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    color: #111;\n    font-weight: 700;\n\}/g,
    '.checkout-sheet .section-title {\n    font-size: 15px;\n    margin-bottom: 12px;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    color: #111;\n    font-weight: 700;\n}'
);

// Add CSS for ingredient icons
const ingCss = `
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
}
.ing-tahil { background: #ffb703; color: #000; } /* Yellow */
.ing-sut { background: #8871a0; } /* Purple */
.ing-dana { background: #e63946; } /* Red */
.ing-tavuk { background: #f4a261; } /* Orange */
`;

if(!css.includes('.ingredient-icons')) {
    css += '\\n' + ingCss;
}
fs.writeFileSync('css/style.css', css);

// 2. Remove the old tags and add new ingredient icons
// Şefin Elinden (Süt, Dana)
html = html.replace(
    '<span class="tag-badge tag-veg" style="font-size:12px; padding:6px 12px; margin-left: 6px;"><i class="fa-solid fa-leaf"></i> Glutensiz</span>',
    ''
);
html = html.replace(
    '<p class="banner-desc">Karışık Kumpir ve Meşrubat. Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin taze mezelerle hazırlanan eşsiz lezzet!</p>',
    '<p class="banner-desc">Karışık Kumpir ve Meşrubat. Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin taze mezelerle hazırlanan eşsiz lezzet!</p>\n                    <div class="ingredient-icons">\n                        <div class="ing-icon ing-sut" title="Süt"><i class="fa-solid fa-bottle-droplet"></i></div>\n                        <div class="ing-icon ing-dana" title="Dana Eti"><i class="fa-solid fa-cow"></i></div>\n                    </div>'
);

// Tatlı Şöleni (Tahıl, Süt)
html = html.replace(
    '<span class="tag-badge" style="font-size:12px; padding:6px 12px; margin-left: 6px; background:#e91e63; color:white;"><i class="fa-solid fa-wheat-awn"></i> Gluten İçerir</span>',
    ''
);
html = html.replace(
    '<p class="banner-desc">Kasede Waffle ve Çay. Bol çikolata sosu ve taptaze meyvelerle harmanlanan kase waffle keyfi, yanında sıcacık tavşan kanı çay ile.</p>',
    '<p class="banner-desc">Kasede Waffle ve Çay. Bol çikolata sosu ve taptaze meyvelerle harmanlanan kase waffle keyfi, yanında sıcacık tavşan kanı çay ile.</p>\n                    <div class="ingredient-icons">\n                        <div class="ing-icon ing-tahil" title="Tahıl"><i class="fa-solid fa-wheat-awn"></i></div>\n                        <div class="ing-icon ing-sut" title="Süt"><i class="fa-solid fa-bottle-droplet"></i></div>\n                    </div>'
);

// Gecelerin Vazgeçilmezi (Tahıl, Dana, Süt)
html = html.replace(
    '<span class="tag-badge" style="font-size:12px; padding:6px 12px; margin-left: 6px; background:#e91e63; color:white;"><i class="fa-solid fa-wheat-awn"></i> Gluten İçerir</span>',
    ''
);
html = html.replace(
    '<p class="banner-desc">Goralı Kumru ve Meşrubat. Özel sosis, ev yapımı rus salatası ve kornişon turşunun yumuşacık sandviç ekmeğiyle buluştuğu doyurucu lezzet.</p>',
    '<p class="banner-desc">Goralı Kumru ve Meşrubat. Özel sosis, ev yapımı rus salatası ve kornişon turşunun yumuşacık sandviç ekmeğiyle buluştuğu doyurucu lezzet.</p>\n                    <div class="ingredient-icons">\n                        <div class="ing-icon ing-tahil" title="Tahıl"><i class="fa-solid fa-wheat-awn"></i></div>\n                        <div class="ing-icon ing-sut" title="Süt"><i class="fa-solid fa-bottle-droplet"></i></div>\n                        <div class="ing-icon ing-dana" title="Dana Eti"><i class="fa-solid fa-cow"></i></div>\n                    </div>'
);

// Sabahın Güneşi (Tahıl, Dana, Süt)
html = html.replace(
    '<span class="tag-badge" style="font-size:12px; padding:6px 12px; margin-left: 6px; background:#e91e63; color:white;"><i class="fa-solid fa-wheat-awn"></i> Gluten İçerir</span>',
    ''
);
html = html.replace(
    '<p class="banner-desc">Ayvalık Tostu ve Çay. Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay.</p>',
    '<p class="banner-desc">Ayvalık Tostu ve Çay. Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay.</p>\n                    <div class="ingredient-icons">\n                        <div class="ing-icon ing-tahil" title="Tahıl"><i class="fa-solid fa-wheat-awn"></i></div>\n                        <div class="ing-icon ing-sut" title="Süt"><i class="fa-solid fa-bottle-droplet"></i></div>\n                        <div class="ing-icon ing-dana" title="Dana Eti"><i class="fa-solid fa-cow"></i></div>\n                    </div>'
);

fs.writeFileSync('index.html', html);
console.log('Fixed section titles and added ingredient icons');
