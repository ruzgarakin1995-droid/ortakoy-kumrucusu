const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Update Title and Header text
html = html.replace(/<title>Ortaköy Kumpircisi & Kumrucusu \| Dijital Menü<\/title>/, '<title>Ortaköy Kumrucusu | Dijital Menü</title>');
html = html.replace(/<h1 class=\"hero-title\" style=\"font-size: 24px;\">Ortaköy Kumpircisi <br> & Kumrucusu<\/h1>/, '<h1 class="hero-title" style="font-size: 24px;">Ortaköy Kumrucusu</h1>');

// 2. Update Logo
html = html.replace(/<img src=\"images\/logo\.png\" alt=\"Ortaköy Kumrucusu Logo\"/g, '<img src="ortakoy-logo.png" alt="Ortaköy Kumrucusu Logo"');

// 3. Update Banner Slider (Kumpir First, add item-badges pop, add slider container/dots)
const newBannerHtml = `<div class="slider-container">
        <div class="banner-slider" id="mainBannerSlider">
            <div class="banner-card">
                <div class="item-badges">
                    <span class="tag-badge tag-pop" style="font-size:12px; padding:6px 12px;"><i class="fa-solid fa-star"></i> Popüler</span>
                </div>
                <div class="banner-img-wrapper">
                    <img src="images/kumpir_kola.png" alt="Karışık Kumpir" class="banner-img">
                </div>
                <div class="banner-content">
                    <h2 class="banner-title">Karışık Kumpir Şöleni</h2>
                    <p class="banner-desc">Dev fırın patates içerisinde bol kaşar, tereyağı, sosis, sucuk ve dilediğin mezeler ile unutulmaz bir lezzet. Yanında buz gibi içecek ile!</p>
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
                    <img src="images/kumru_patates_kola.png" alt="Ortaköy Özel Menü" class="banner-img">
                </div>
                <div class="banner-content">
                    <h2 class="banner-title">Efsane Kumru Menü</h2>
                    <p class="banner-desc">1x Orijinal İzmir Kumru (Sucuk, salam, sosis, kaşar peyniri, domates) + Patates Tava (150 g) + İçecek (Kutu Kola). Şehrin en doyurucu üçlüsü!</p>
                    <div class="banner-footer">
                        <span class="banner-price">330₺</span>
                        <button class="btn-large">Siparişe Ekle</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="slider-dots" id="bannerDots">
            <div class="slider-dot active" data-index="0"></div>
            <div class="slider-dot" data-index="1"></div>
        </div>
    </div>`;

html = html.replace(/<div class=\"banner-slider\">[\s\S]*?<\/div>\s*<\/div>/, newBannerHtml);

// 4. Add Kumpir Menü to Kampanyalar
const kumpirMenuHtml = `
            <div class="card-highlight">
                <div class="item-badges">
                    <span class="tag-badge tag-pop"><i class="fa-solid fa-star"></i> Popüler</span>
                </div>
                <div class="card-img-wrapper">
                    <img src="images/kumpir_kola.png" alt="Karışık Kumpir Menü" class="card-img">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Karışık Kumpir + Meşrubat</h3>
                    <p class="item-ingredients">Büyük boy fırın patates, tereyağı, kaşar peyniri, sosis, sucuk, mısır, zeytin, kornişon ve seçtiğiniz 330ml kutu içecek.</p>
                    <div class="allergen-icons">
                        <div class="allergen-icon sut"><i class="fa-solid fa-bottle-droplet"></i></div>
                        <div class="allergen-icon sulfit"><i class="fa-solid fa-flask"></i></div>
                    </div>
                    <div class="card-footer" style="margin-top: 12px;">
                        <span class="price">420 ₺</span>
                        <button class="btn-add"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>`;

// Insert it right after `<h2 class="section-title"><i class="fa-solid fa-fire"></i> Kampanyalı Menüler</h2>`
html = html.replace(/(<h2 class=\"section-title\"><i class=\"fa-solid fa-fire\"><\/i> Kampanyalı Menüler<\/h2>)/, '$1' + kumpirMenuHtml);

// 5. Add JS for Auto-Slide
const scriptInjection = `
        // Banner Slider Auto-play
        const slider = document.getElementById('mainBannerSlider');
        const dots = document.querySelectorAll('#bannerDots .slider-dot');
        let currentSlide = 0;
        let slideInterval;

        function updateDots(index) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % dots.length;
            const scrollLeft = slider.clientWidth * currentSlide;
            slider.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            updateDots(currentSlide);
        }

        if (slider && dots.length > 0) {
            slideInterval = setInterval(nextSlide, 5000);
            
            // Allow manual sync of dots on manual scroll
            slider.addEventListener('scroll', () => {
                const index = Math.round(slider.scrollLeft / slider.clientWidth);
                if (index !== currentSlide) {
                    currentSlide = index;
                    updateDots(currentSlide);
                }
            });
            
            // Reset timer on manual touch
            slider.addEventListener('touchstart', () => {
                clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, 5000);
            });
        }
`;

html = html.replace(/(\/\/ Basic filter active toggling script)/, scriptInjection + '\n        $1');

fs.writeFileSync('index.html', html);
console.log('HTML update 2 complete.');
