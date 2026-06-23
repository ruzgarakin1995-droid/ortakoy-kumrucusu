const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newFeaturedGrid = `
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

    <section id="kampanyali" class="menu-section">`;

const regex = /<!-- Featured Grid -->.*?<section id="kampanyali" class="menu-section">/s;

html = html.replace(regex, newFeaturedGrid);

fs.writeFileSync('index.html', html);
console.log('Fixed the featured grid layout and tags');
