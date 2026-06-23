const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const checks = [
    'Kasap Köfte Porsiyon',
    'Tavuk İncik Porsiyon',
    'Kasede Waffle',
    'Bardakta Waffle',
    'Bitki Çayı',
    'Karadut Özü',
    'Sade Soda',
    'Churchill'
];

checks.forEach(check => {
    // Find the img tag before this text
    const idx = html.indexOf(check);
    if (idx !== -1) {
        const snippet = html.substring(idx - 150, idx);
        const imgMatch = snippet.match(/<img src="([^"]+)"/);
        console.log(`${check} => ${imgMatch ? imgMatch[1] : 'NOT FOUND'}`);
    } else {
        console.log(`${check} text not found in HTML!`);
    }
});
