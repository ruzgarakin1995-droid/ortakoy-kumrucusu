const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const correctBlock = `<!-- Search & Filters -->
    <section class="search-filter-section">
        <div class="search-bar">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Ürün ara...">
        </div>
    </section>

    <!-- Sticky Navigation -->
    <nav class="sticky-nav">
        <div class="nav-container">
            <a href="#kampanyali" class="nav-item active nav-pulse">🔥 Kampanyalar</a>
            <a href="#durumler" class="nav-item">Dürümler</a>
            <a href="#porsiyonlar" class="nav-item">Porsiyonlar</a>
            <a href="#tostlar" class="nav-item">Tostlar</a>
            <a href="#kumpirler" class="nav-item">Kumpirler</a>
            <a href="#kumrular" class="nav-item">İzmir Kumru</a>
            <a href="#burgerler" class="nav-item">Burgerler</a>
            <a href="#ekmek-arasi" class="nav-item">Ekmek Arası</a>
            <a href="#tatlilar" class="nav-item">Tatlılar</a>
            <a href="#icecekler" class="nav-item">İçecekler</a>
        </div>
    </nav>
    <div class="filter-chips" style="padding-top: 0; padding-bottom: 24px;">
        <div class="chip active">Tümü</div>
        <div class="chip"><i class="fa-solid fa-heart" style="color:#e91e63;"></i> Favoriler</div>
        <div class="chip"><i class="fa-solid fa-star" style="color:#fbbc04;"></i> Popüler</div>
        <div class="chip"><i class="fa-solid fa-pepper-hot" style="color:#ea4335;"></i> Acılı</div>
        <div class="chip"><i class="fa-solid fa-leaf" style="color:#34a853;"></i> Vejetaryen</div>
    </div>

    <!-- Main Content -->`;

const regex = /<!-- Search & Filters -->.*?<!-- Main Content -->/s;
html = html.replace(regex, correctBlock);

fs.writeFileSync('index.html', html);
console.log('Fixed broken HTML block');
