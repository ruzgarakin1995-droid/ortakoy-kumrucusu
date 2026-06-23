const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="filter-chips".*?>.*?<\/div>\s*<\/div>\s*<!-- Main Content -->/s;
// Let's be more precise.
const regex2 = /<div class="filter-chips".*?<\/div>\s*<!-- Main Content -->/s;
// Wait, filter-chips has multiple divs inside.
const regex3 = /<div class="filter-chips".*?<\/div>\s*<\/div>\s*<!-- Main Content -->/s;
// Let's just find exactly what we added.

const filterChipsHTML = `    <div class="filter-chips" style="padding-top: 0; padding-bottom: 24px;">
        <div class="chip active">Tümü</div>
        <div class="chip"><i class="fa-solid fa-heart" style="color:#e91e63;"></i> Favoriler</div>
        <div class="chip"><i class="fa-solid fa-star" style="color:#fbbc04;"></i> Popüler</div>
        <div class="chip"><i class="fa-solid fa-pepper-hot" style="color:#ea4335;"></i> Acılı</div>
        <div class="chip"><i class="fa-solid fa-leaf" style="color:#34a853;"></i> Vejetaryen</div>
    </div>`;

html = html.replace(filterChipsHTML, '');
html = html.replace(/\n\s*\n\s*<!-- Main Content -->/, '\n\n    <!-- Main Content -->');

fs.writeFileSync('index.html', html);
console.log('Filter chips removed');
