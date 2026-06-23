const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const checks = [
    'Nescafe',
    'Latte',
    'Amerikano',
    'Americano',
    'Sıcak Çikolata',
    'Türk Kahvesi',
    'Bardakta Waffle'
];

checks.forEach(check => {
    const idx = html.indexOf(`<h3>${check}</h3>`);
    if (idx !== -1) {
        const snippet = html.substring(idx - 150, idx);
        const imgMatch = snippet.match(/<img src="([^"]+)"/);
        console.log(`${check} => ${imgMatch ? imgMatch[1] : 'NOT FOUND'}`);
    } else {
        console.log(`<h3>${check}</h3> not found!`);
    }
});
