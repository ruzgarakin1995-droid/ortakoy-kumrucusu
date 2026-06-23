const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const replacement = `                    <div class="ingredient-icons">
                        <div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü"><i class="fa-solid fa-bottle-droplet"></i></div>
                        <div class="ing-icon ing-dana" tabindex="0" title="Et Ürünleri"><i class="fa-solid fa-cow"></i></div>
                    </div>
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
                    <img src="images/tatli_cay.png" alt="🍰 Tatlı Şöleni" class="card-img">
                </div>
                <div class="card-content">
                    <h3 class="card-title">🍰 Tatlı Şöleni</h3>
                    <p class="item-ingredients">Kasede Waffle ve Çay. Bol çikolata sosu ve taptaze meyvelerle harmanlanan kase waffle keyfi, yanında sıcacık tavşan kanı çay ile.</p>
                    <div class="ingredient-icons">
                        <div class="ing-icon ing-tahil" tabindex="0" title="Tahıl / Gluten"><i class="fa-solid fa-wheat-awn"></i></div>
                        <div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü"><i class="fa-solid fa-bottle-droplet"></i></div>
                    </div>
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
                    <img src="images/gorali_kola.png" alt="🌙 Gecelerin Vazgeçilmezi" class="card-img">
                </div>
                <div class="card-content">
                    <h3 class="card-title">🌙 Gecelerin Vazgeçilmezi</h3>
                    <p class="item-ingredients">Goralı Kumru ve Meşrubat. Özel sosis, ev yapımı rus salatası ve kornişon turşunun yumuşacık sandviç ekmeğiyle buluştuğu doyurucu lezzet.</p>
                    <div class="ingredient-icons">
                        <div class="ing-icon ing-tahil" tabindex="0" title="Tahıl / Gluten"><i class="fa-solid fa-wheat-awn"></i></div>
                        <div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü"><i class="fa-solid fa-bottle-droplet"></i></div>
                        <div class="ing-icon ing-dana" tabindex="0" title="Et Ürünleri"><i class="fa-solid fa-cow"></i></div>
                    </div>
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
                    <img src="images/tost_cay.png" alt="☀️ Sabahın Güneşi" class="card-img">
                </div>
                <div class="card-content">
                    <h3 class="card-title">☀️ Sabahın Güneşi</h3>
                    <p class="item-ingredients">Ayvalık Tostu ve Çay. Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay.</p>
                    <div class="ingredient-icons">
                        <div class="ing-icon ing-tahil" tabindex="0" title="Tahıl / Gluten"><i class="fa-solid fa-wheat-awn"></i></div>
                        <div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü"><i class="fa-solid fa-bottle-droplet"></i></div>
                        <div class="ing-icon ing-dana" tabindex="0" title="Et Ürünleri"><i class="fa-solid fa-cow"></i></div>
                    </div>
                    <div class="card-footer" style="margin-top: 12px;">
                        <span class="price">290 ₺</span>
                        <button class="btn-add"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>
        </section>

        <!-- 5. KUMPİRLER -->
        <section id="kumpirler" class="menu-section">
            <h2 class="section-title">🥔 Kumpirler</h2>
            <div class="list-item">
                <div class="item-badges"><span class="tag-badge tag-pop"><i class="fa-solid fa-star"></i> Popüler</span></div>
                <div class="list-item-thumb"><img src="images/kumpir.png" alt="Karışık Kumpir"></div>
                <div class="list-item-content"><div class="list-item-info"><h3>Karışık Kumpir</h3><p class="item-ingredients">Büyük boy fırın patates (400 g), tereyağı, bol kaşar, sosis, salam, amerikan salatası, zeytin, mısır, kornişon.</p>
                    <div class="ingredient-icons">
                        <div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü"><i class="fa-solid fa-bottle-droplet"></i></div>
                        <div class="ing-icon ing-dana" tabindex="0" title="Et Ürünleri"><i class="fa-solid fa-cow"></i></div>
                    </div></div><div class="list-item-bottom"><div class="list-item-price">450 ₺</div><button class="btn-add-small"><i class="fa-solid fa-plus"></i></button></div></div>
            </div>`;

// Let's find the broken Şefin Elinden block up to the stolen list-item-bottom
const brokenString = `                    <div class="ingredient-icons">
                        <div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü"><i class="fa-solid fa-bottle-droplet"></i></div>
                        <div class="ing-icon ing-dana" tabindex="0" title="Et Ürünleri"><i class="fa-solid fa-cow"></i></div>
                    </div></div><div class="list-item-bottom"><div class="list-item-price">450 ₺</div><button class="btn-add-small"><i class="fa-solid fa-plus"></i></button></div></div>
            </div>`;

html = html.replace(brokenString, replacement);
fs.writeFileSync('index.html', html);
console.log('Restored the eaten elements successfully!');
