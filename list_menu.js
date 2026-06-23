const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = html.match(/<h2 class="section-title">.*?<\/h2>/g);
if (matches) {
    matches.forEach(m => console.log(m));
} else {
    console.log("No section titles found.");
}

console.log('--- ITEMS ---');
const itemMatches = html.match(/<h3.*?>.*?<\/h3>.*?<span class="price">.*?<\/span>|<h3.*?>.*?<\/h3>.*?<div class="list-item-price">.*?<\/div>/g);
if (itemMatches) {
    itemMatches.forEach(m => {
        const title = m.match(/<h3.*?>(.*?)<\/h3>/)[1].replace(/<[^>]+>/g, '');
        const priceMatch = m.match(/<span class="price">(.*?)<\/span>|<div class="list-item-price">(.*?)<\/div>/);
        const price = priceMatch ? (priceMatch[1] || priceMatch[2]).replace(/<[^>]+>/g, '') : 'N/A';
        console.log(title + ' - ' + price);
    });
}
