const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let css = fs.readFileSync('css/style.css', 'utf8');

// 1. Revert CSS .filter-btn to .chip
css = css.replace(/\.filter-btn/g, '.chip');

// 2. Add Delivery Apps CSS
const deliveryCss = `
.delivery-apps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}
.delivery-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  color: #fff;
  font-size: 16px;
  transition: opacity 0.3s;
}
.delivery-btn:hover {
  opacity: 0.9;
}
.delivery-btn.migros { background: #ff7f00; }
.delivery-btn.yemeksepeti { background: #ea004b; }
.delivery-btn.getir { background: #5d3ebc; color: #ffd300; }
`;
if (!css.includes('.delivery-btn.migros')) {
    css += '\n' + deliveryCss;
}

fs.writeFileSync('css/style.css', css);


// HTML UPDATES
// Slider titles and descriptions
html = html.replace(/<h2 class="banner-title">Şefin Elinden<\/h2>\s*<p class="banner-desc">Karışık Kumpir ve Meşrubat\. Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin mezeler!<\/p>/, 
    '<h2 class="banner-title">Şefin Elinden <span style="font-weight: 300; color: var(--text-muted); font-size: 0.8em;">(Karışık Kumpir ve Meşrubat)</span></h2><p class="banner-desc">Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin taze mezelerle hazırlanan eşsiz lezzet!</p>');

html = html.replace(/<h2 class="banner-title">Tatlı Şöleni<\/h2>\s*<p class="banner-desc">Kasede Waffle ve Çay\. Bol çikolata ve taptaze meyvelerle hazırlanan kase waffle, yanında sıcak çay ile\.<\/p>/, 
    '<h2 class="banner-title">Tatlı Şöleni <span style="font-weight: 300; color: var(--text-muted); font-size: 0.8em;">(Kasede Waffle ve Çay)</span></h2><p class="banner-desc">Bol çikolata sosu ve taptaze meyvelerle harmanlanan kase waffle keyfi, yanında sıcacık tavşan kanı çay ile.</p>');

html = html.replace(/<h2 class="banner-title">Gecelerin Vazgeçilmezi<\/h2>\s*<p class="banner-desc">Goralı Kumru ve Meşrubat\. Özel sosis, rus salatası, turşu ve taptaze sandviç ekmeğiyle klasik lezzet\.<\/p>/, 
    '<h2 class="banner-title">Gecelerin Vazgeçilmezi <span style="font-weight: 300; color: var(--text-muted); font-size: 0.8em;">(Goralı Kumru ve Meşrubat)</span></h2><p class="banner-desc">Özel sosis, ev yapımı rus salatası ve kornişon turşunun yumuşacık sandviç ekmeğiyle buluştuğu efsanevi klasik tat.</p>');

html = html.replace(/<h2 class="banner-title">Sabahın Güneşi<\/h2>\s*<p class="banner-desc">Ayvalık Tost ve Çay\. Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay\.<\/p>/, 
    '<h2 class="banner-title">Sabahın Güneşi <span style="font-weight: 300; color: var(--text-muted); font-size: 0.8em;">(Ayvalık Tost ve Çay)</span></h2><p class="banner-desc">Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay.</p>');


// Slider interval 5000 -> 10000
html = html.replace(/setInterval\(nextSlide, 5000\)/g, 'setInterval(nextSlide, 10000)');

// Text fixes
html = html.replace(/Çalışma Saatleri<\/h3>/, 'Çalışma Saatlerimiz</h3>');
html = html.replace(/Şimdi Açık<\/span>/, 'Şuan Açık</span>');

// Google Yorum %10 Indirim
html = html.replace(/<h4>Google Yorumlar<\/h4>/, '<h4>Google Yorumu Yap, %10 İndirim Kazan!</h4>');

// Stars text addition
const oldStarsHtml = `<div class="stars">
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
            </div>
            <p>Yıldızlara tıklayarak bizi Google'da puanlayın!</p>`;
const newStarsHtml = `<div class="stars">
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
            </div>
            <p>Yıldızlara tıklayarak bizi Google'da puanlayın!</p>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">Kasada yaptığınız yorumu göstermeyi unutmayınız.</p>`;
html = html.replace(oldStarsHtml, newStarsHtml);

// Delivery Apps update
// Find the old map-links or delivery section. Wait, there was no delivery section exactly, but user provided links in the prompt for Migros, Yemeksepeti, Getir. Let's see if they exist in html.
// In the first messages, I had a .contact-links or similar.
// "Yemekspeti migros yemek ve getir yemek için o kısıma daha güzel bir tasarım yap alt alta. "
// Let's replace the whole contact-links part if it exists, or just find where I put the delivery links.
// I'll search for 'yemeksepeti' in html.
const deliveryRegex = /<div class="contact-links">\s*<a href="https:\/\/www\.migros\.com\.tr\/yemek.*?<\/div>/s;
const newDeliveryHtml = `<div class="delivery-apps">
            <a href="https://www.migros.com.tr/yemek/ortakoy-kumrucusu-burhaniye-ogretmenler-mah-st-323b3?srsltid=AfmBOoq5f9zm2FWz18wgHW92eu8x3OR1hV6UBVU4MflrCbzemSqO7alC" target="_blank" class="delivery-btn migros">
                <i class="fa-solid fa-motorcycle"></i> Migros Yemek ile Sipariş Ver
            </a>
            <a href="https://www.yemeksepeti.com/restaurant/kis1/ortakoy-kumrucusu?srsltid=AfmBOopb92QPwJszrHiukZcyRhN6t-3c_85qTJ4-cp9Bxvs-wZDUvmjJ" target="_blank" class="delivery-btn yemeksepeti">
                <i class="fa-solid fa-motorcycle"></i> Yemeksepeti ile Sipariş Ver
            </a>
            <a href="https://getir.com/yemek/restoran/ortakoy-kumpircisi-burhaniye-ogretmenler-mah-burhaniye-balikesir/" target="_blank" class="delivery-btn getir">
                <i class="fa-solid fa-motorcycle"></i> GetirYemek ile Sipariş Ver
            </a>
        </div>`;

if(html.match(deliveryRegex)) {
    html = html.replace(deliveryRegex, newDeliveryHtml);
} else {
    // If not found by exact regex, try replacing contact-links broadly if it contains Yemeksepeti
    html = html.replace(/<div class="contact-links">[\s\S]*?Getir Yemek[\s\S]*?<\/div>/, newDeliveryHtml);
}

// Maps logos update
const newMaps = `<div class="map-links">
                <a href="https://maps.google.com/?q=Öğretmenler,+Muammer+Aksoy+Cd.+No:34,+10700+Burhaniye/Balıkesir,+Türkiye" target="_blank" class="map-link-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Google_Maps_icon.svg" alt="Google Maps" style="width:32px; height:32px;">
                    Google Maps
                </a>
                <a href="https://yandex.com/maps/?text=Öğretmenler,+Muammer+Aksoy+Cd.+No:34,+10700+Burhaniye/Balıkesir,+Türkiye" target="_blank" class="map-link-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/86/Yandex_Maps_icon.svg" alt="Yandex Maps" style="width:32px; height:32px;">
                    Yandex Maps
                </a>
                <a href="http://maps.apple.com/?q=Öğretmenler,+Muammer+Aksoy+Cd.+No:34,+10700+Burhaniye/Balıkesir,+Türkiye" target="_blank" class="map-link-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Apple_Maps_icon_%282020%29.svg" alt="Apple Maps" style="width:32px; height:32px;">
                    Apple Maps
                </a>
            </div>`;

html = html.replace(/<div class="map-links">[\s\S]*?<\/div>/, newMaps);

// Specific product images replacements
// Kasede Waffle -> images/kasede_waffle.png
html = html.replace(/(<h3 class="card-title">Kasede Waffle<\/h3>\s*<p class="item-ingredients">Parçalanmış waffle hamuru.*?<img src=")images\/[a-zA-Z0-9_]+\.png(" alt="Kasede Waffle" class="card-img">)/s, function(match, p1, p2) {
    return html.match(/<h3 class="card-title">Kasede Waffle<\/h3>/) ? match.replace(/images\/[a-zA-Z0-9_]+\.png/, 'images/kasede_waffle.png') : match;
});
// A more robust way to replace specifically:
html = html.replace(/(alt="Kasede Waffle" class="card-img")/, 'src="images/kasede_waffle.png" $1');
// Since regex might be tricky if src is before alt, let's just use string replace on the whole block:
// Better: just replace all `images/tatli.png` and `images/limonata.png` for specific items manually or via a simpler regex
function replaceImgSrcForTitle(htmlStr, title, newImg) {
    let regex = new RegExp(`(<img src=")([^"]+)(" alt="${title}" class="card-img">\\s*<\\/div>\\s*<div class="card-content">\\s*<h3 class="card-title">${title}<\\/h3>)`, 'g');
    if (!htmlStr.match(regex)) {
        // Try alternate order
        regex = new RegExp(`(<img src=")([^"]+)(" alt="${title}".*?)(<h3 class="card-title">${title}<\\/h3>)`, 's');
    }
    // Simplest: 
    const blockRegex = new RegExp(`(<div class="card-img-wrapper">\\s*<img src=")[^"]+(" alt="${title}" class="card-img">\\s*<\\/div>\\s*<div class="card-content">\\s*<h3 class="card-title">${title}<\\/h3>)`);
    return htmlStr.replace(blockRegex, `$1${newImg}$2`);
}

html = replaceImgSrcForTitle(html, "Kasede Waffle", "images/kasede_waffle.png");
html = replaceImgSrcForTitle(html, "Bardakta Tatlı", "images/bardakta_tatli.png");
html = replaceImgSrcForTitle(html, "Bitki Çayı", "images/bitki_cayi.png");
html = replaceImgSrcForTitle(html, "Sade Soda", "images/sade_soda.png");
html = replaceImgSrcForTitle(html, "Churchill", "images/churchill.png");
html = replaceImgSrcForTitle(html, "Karadut Özü", "images/karadut.png");

fs.writeFileSync('index.html', html);
console.log('Update 4 complete');
