const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const sliderHtml = `
        <div class="slider-container">
        <div class="banner-slider" id="mainBannerSlider">
            <div class="banner-card">
                <div class="item-badges">
                    <span class="tag-badge tag-pop" style="font-size:12px; padding:6px 12px;"><i class="fa-solid fa-star"></i> Popüler</span>
                </div>
                <div class="banner-img-wrapper">
                    <img src="images/kumpir_kola.png" alt="Şefin Elinden" class="banner-img">
                </div>
                <div class="banner-content">
                    <h2 class="banner-title">Şefin Elinden</h2>
                    <p class="banner-desc">Karışık Kumpir ve Meşrubat. Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin taze mezelerle hazırlanan eşsiz lezzet!</p>
                    <div class="banner-footer">
                        <span class="banner-price">420₺</span>
                        <button class="btn-large">Siparişe Ekle</button>
                    </div>
                </div>
            </div>
            <div class="banner-card">
                <div class="item-badges">
                    <span class="tag-badge tag-pop" style="font-size:12px; padding:6px 12px;"><i class="fa-solid fa-star"></i> Popüler</span>
                </div>
                <div class="banner-img-wrapper">
                    <img src="images/tatli_cay.png" alt="Tatlı Şöleni" class="banner-img">
                </div>
                <div class="banner-content">
                    <h2 class="banner-title">Tatlı Şöleni</h2>
                    <p class="banner-desc">Kasede Waffle ve Çay. Bol çikolata sosu ve taptaze meyvelerle harmanlanan kase waffle keyfi, yanında sıcacık tavşan kanı çay ile.</p>
                    <div class="banner-footer">
                        <span class="banner-price">360₺</span>
                        <button class="btn-large">Siparişe Ekle</button>
                    </div>
                </div>
            </div>
            <div class="banner-card">
                <div class="item-badges">
                    <span class="tag-badge tag-pop" style="font-size:12px; padding:6px 12px;"><i class="fa-solid fa-star"></i> Popüler</span>
                </div>
                <div class="banner-img-wrapper">
                    <img src="images/gorali_kola.png" alt="Gecelerin Vazgeçilmezi" class="banner-img">
                </div>
                <div class="banner-content">
                    <h2 class="banner-title">Gecelerin Vazgeçilmezi</h2>
                    <p class="banner-desc">Goralı Kumru ve Meşrubat. Özel sosis, ev yapımı rus salatası ve kornişon turşunun yumuşacık sandviç ekmeğiyle buluştuğu doyurucu lezzet.</p>
                    <div class="banner-footer">
                        <span class="banner-price">340₺</span>
                        <button class="btn-large">Siparişe Ekle</button>
                    </div>
                </div>
            </div>
            <div class="banner-card">
                <div class="item-badges">
                    <span class="tag-badge tag-pop" style="font-size:12px; padding:6px 12px;"><i class="fa-solid fa-star"></i> Popüler</span>
                </div>
                <div class="banner-img-wrapper">
                    <img src="images/tost_cay.png" alt="Sabahın Güneşi" class="banner-img">
                </div>
                <div class="banner-content">
                    <h2 class="banner-title">Sabahın Güneşi</h2>
                    <p class="banner-desc">Ayvalık Tostu ve Çay. Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay.</p>
                    <div class="banner-footer">
                        <span class="banner-price">290₺</span>
                        <button class="btn-large">Siparişe Ekle</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="slider-dots" id="bannerDots">
            <div class="slider-dot active" data-index="0"></div>
            <div class="slider-dot" data-index="1"></div>
            <div class="slider-dot" data-index="2"></div>
            <div class="slider-dot" data-index="3"></div>
        </div>
    </div>`;

// Replace everything from <div class="slider-container"> to right before <!-- Featured Grid -->
const regex = /<div class="slider-container">.*?<!-- Featured Grid -->/s;
html = html.replace(regex, sliderHtml + '\n\n    <!-- Featured Grid -->');

fs.writeFileSync('index.html', html);
console.log('Slider fixed.');
