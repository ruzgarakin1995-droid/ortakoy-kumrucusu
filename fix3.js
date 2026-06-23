const fs = require('fs');

// Append CSS
let css = fs.readFileSync('css/style.css', 'utf8');
const toastCss = `
/* Toast Notification Component */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: -100%;
  background: var(--surface-color);
  border: 1px solid var(--primary-color);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
  z-index: 9999;
  transition: right 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  max-width: 85%;
}

.toast-container.show {
  right: 24px;
}

.toast-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--glass-border);
}

.toast-content {
  flex: 1;
}

.toast-content h4 {
  color: var(--primary-color);
  font-size: 11px;
  text-transform: uppercase;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.toast-content p {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}
`;
if (!css.includes('.toast-container')) {
    fs.writeFileSync('css/style.css', css + '\n' + toastCss);
}

// Update HTML
let html = fs.readFileSync('index.html', 'utf8');

const newSliderHtml = `<div class="slider-container">
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
                    <p class="banner-desc">Karışık Kumpir ve Meşrubat. Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin mezeler!</p>
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
                    <p class="banner-desc">Kasede Waffle ve Çay. Bol çikolata ve taptaze meyvelerle hazırlanan kase waffle, yanında sıcak çay ile.</p>
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
                    <p class="banner-desc">Goralı Kumru ve Meşrubat. Özel sosis, rus salatası, turşu ve taptaze sandviç ekmeğiyle klasik lezzet.</p>
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
                    <p class="banner-desc">Ayvalık Tost ve Çay. Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay.</p>
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

html = html.replace(/<div class=\"slider-container\">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newSliderHtml);

// Insert Toast HTML at the end of body
if (!html.includes('toast-container')) {
    const toastHtml = `
    <!-- Toast Notification -->
    <div class="toast-container" id="menuToast">
        <img src="" alt="Menu Image" class="toast-img" id="toastImg">
        <div class="toast-content">
            <h4>Bunu denemiş miydiniz?</h4>
            <p id="toastText">Lezzet</p>
        </div>
    </div>`;
    html = html.replace(/<\/body>/, toastHtml + '\n</body>');
}

// Update the 4 items in Kampanyalar
const kampanyalarHtml = `
            <div class="card-highlight">
                <div class="item-badges">
                    <span class="tag-badge tag-pop"><i class="fa-solid fa-star"></i> Popüler</span>
                </div>
                <div class="card-img-wrapper">
                    <img src="images/kumpir_kola.png" alt="Şefin Elinden" class="card-img">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Şefin Elinden</h3>
                    <p class="item-ingredients">Karışık Kumpir ve Meşrubat.</p>
                    <div class="card-footer" style="margin-top: 12px;">
                        <span class="price">420 ₺</span>
                        <button class="btn-add"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>
            
            <div class="card-highlight">
                <div class="item-badges">
                    <span class="tag-badge tag-pop"><i class="fa-solid fa-star"></i> Popüler</span>
                </div>
                <div class="card-img-wrapper">
                    <img src="images/tatli_cay.png" alt="Tatlı Şöleni" class="card-img">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Tatlı Şöleni</h3>
                    <p class="item-ingredients">Kasede Waffle ve Çay.</p>
                    <div class="card-footer" style="margin-top: 12px;">
                        <span class="price">360 ₺</span>
                        <button class="btn-add"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>

            <div class="card-highlight">
                <div class="item-badges">
                    <span class="tag-badge tag-pop"><i class="fa-solid fa-star"></i> Popüler</span>
                </div>
                <div class="card-img-wrapper">
                    <img src="images/gorali_kola.png" alt="Gecelerin Vazgeçilmezi" class="card-img">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Gecelerin Vazgeçilmezi</h3>
                    <p class="item-ingredients">Goralı Kumru ve Meşrubat.</p>
                    <div class="card-footer" style="margin-top: 12px;">
                        <span class="price">340 ₺</span>
                        <button class="btn-add"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>

            <div class="card-highlight">
                <div class="item-badges">
                    <span class="tag-badge tag-pop"><i class="fa-solid fa-star"></i> Popüler</span>
                </div>
                <div class="card-img-wrapper">
                    <img src="images/tost_cay.png" alt="Sabahın Güneşi" class="card-img">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Sabahın Güneşi</h3>
                    <p class="item-ingredients">Ayvalık Tost ve Çay.</p>
                    <div class="card-footer" style="margin-top: 12px;">
                        <span class="price">290 ₺</span>
                        <button class="btn-add"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>
`;

// Insert the 4 cards into "Kampanyalı Menüler" section and remove the previous Kumpir + Cola
html = html.replace(/(<h2 class="section-title"><i class="fa-solid fa-fire"><\/i> Kampanyalı Menüler<\/h2>)\s*<div class="card-highlight">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '$1' + kampanyalarHtml);


// Add JS for toast notification
const toastJS = `
        // Toast Notification Logic
        const menus = [
            { name: "Şefin Elinden", img: "images/kumpir_kola.png" },
            { name: "Tatlı Şöleni", img: "images/tatli_cay.png" },
            { name: "Gecelerin Vazgeçilmezi", img: "images/gorali_kola.png" },
            { name: "Sabahın Güneşi", img: "images/tost_cay.png" }
        ];
        
        const toastEl = document.getElementById('menuToast');
        const toastImg = document.getElementById('toastImg');
        const toastText = document.getElementById('toastText');
        
        // Base64 short pop sound
        const popSoundUrl = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYxLjEuMTAwAAAAAAAAAAAAAAD/+0DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAUAAAAcAAAAJQAFAAwAExodIigvMz0/QktOWF1jZ2tucnZ7f4OGjZKUmZ2jpqmvsrW5vcLDxsrOz9TV2dzh5unt8PT4/P8AAAAATGF2YzYxLjMuMTAwAAAAAAAAAAAAAAAAJAAAAAAAAAAAUCYh0qUAAAAAAAAAAAAAAAAAAAAAAAD/+0DAAAAEAAK2QAAAgAAZQQAAAYvF3kIAAMcAIpQAAANyL6wAAAA1wH3Xv/uSBAXoHn/+9B6A1A7A71//+rEAhYkSBAe//v//1IgKIEBv//1ZAgIIB3///6tCBRAgP//q9RBAgIgD3/6//7EAQAEB+BAoD//9WAggIIB3/1P/+xIEACANAAeBAgL//1aCBAggEAFgECA+//qwQIECAgPAgIEAf/q0hBAQkEQCA+BBBEAQQEBBBP/1YgAILAAQEQAgIAgEQhEIgEAwD/9WkIEBABAIDwIIDwEAgEDwBAIA///ViIgIEBAIEAEAgEAQDAAIEBEM///VqIEIEAgHgICAgGAACAgEAwAA//1YQCAQgDAEAQDAQDAEBAQCBAQA///VoQEA0EABAIAACBAQCBAIAAEB//1YhEgEAgBAAAAIBAIEAgHgIBAIB//VoEAAgBAgIAwBAQCAQCAoAAABH//1aYAEBgMBAMAAAEAQDAAgEAQDAAf//1YQAECgKAAIAABAAEA4FAwBAAAA//1aIQAIAAAEBAMABAEBQIBAAAgBA//1YAECAgHgYBAAABAACAQCBAkEAf//1qgAAQCAQCABAAABAQEBgIAAQCA//1YoAgAgAEAAgAAAQBAQCBAAQAw//1qYIBAICBAAEAgAAAAAEAABAAAA//1YYEAAABAEAQIBAIEAAhAAIBAP///9WrAAAAAACAACAIEAAgEAQAIAEQP/1YYAAAAEAAQDAAEAQFAoEAAABAH//1awAAAAAEAQFA4EAgAAAAQIAhEf/1YYAAACBAAgAAAAQAABAkAAAIBH//1awEAAAAIEAgAAAAEAAQCAAQAAP/1YYACAABAAQAABAEAgQCAQEAwBA//1awEAQCBAEAAAAAAAEAgACAABAP/1YQEAQEAAEAQAAACBAAAAEAAAAP/1agEAwAAAQAAQCBAQBAAAEAwEBA//1agAQDAAAEAQEAwEAAEAQBAIAE//1YgEBAMAAQEAgAAQEBAQAAABAA//1bIIBAMAEAgGAAAAABAAAAEAwP/1bAEAgEAAEAwHAAEAQEAgIBAAA//1aQEAQAAAAIAAIBAABAAAAIAkH/1aAEAgCBAEAwDAABAMBAAEAgH//1Z4IAwAEAQFAAEAwFA4EAAQIH/1Z4ACBAAIBAMAgGAAQDAQDAf//1ZYIEAgOBAABAAAAAAEEBAP/1aIAQDAAEAQAABAABAAAAE//1YwIAwEAwGAAIBAgAAAACH/1aoACAQDAIAgEAAgQDAkQ//1ZwEAgUBAIAgEAAAAQDH/1aAEAQBAQBAEBAwAAAAH/1agEAwAAEAQDAAAAAAAf/1YAAAAAAAADAAAAAAX/1cgAAAAAAAACAA///9WoAAAAAAABAAX//1YQAAAAAAAAAD//1bsAAAAAAAAAAH/1eQAAAAAAAH//1dAAAAAAAAA//1fEAAAAAAH//1coAAAAAD//1cgAAAAAH//1c4AAAAP//1eoAAAAH//1bwAAAD//1gIAAAP//1jYAAH//1eIAAD//1lUAAH//1hwAAD//1s4AAD//1ngAAD//1yEAAD//2Q==";

        function showToast() {
            // Randomly select a menu
            const randomMenu = menus[Math.floor(Math.random() * menus.length)];
            toastImg.src = randomMenu.img;
            toastText.textContent = randomMenu.name;
            
            // Play sound
            const audio = new Audio(popSoundUrl);
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio play failed:', e));
            
            // Show toast
            toastEl.classList.add('show');
            
            // Hide after 4 seconds
            setTimeout(() => {
                toastEl.classList.remove('show');
            }, 4000);
        }

        // Show toast every 15 seconds
        setInterval(showToast, 15000);
`;

html = html.replace(/(\/\/ Reset timer on manual touch\s*}\s*})/, '$1\n' + toastJS);

fs.writeFileSync('index.html', html);
console.log('Final HTML and CSS update complete.');
