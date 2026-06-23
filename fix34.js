const fs = require('fs');
const path = require('path');

// 1. Move images
const artifactDir = 'C:\\Users\\egem2\\.gemini\\antigravity\\brain\\41618512-b5f3-4f1d-83c8-e091389e90ca';
const destDir = 'c:/Users/egem2/Desktop/ortakoy-kumrucusu/images';

const files = fs.readdirSync(artifactDir);
const ekmekFile = files.find(f => f.startsWith('ekmek_arasi_') && f.endsWith('.png'));
const patatesFile = files.find(f => f.startsWith('patates_kizartmasi_kapta_') && f.endsWith('.png'));

if (ekmekFile) {
    fs.copyFileSync(path.join(artifactDir, ekmekFile), path.join(destDir, 'ekmek_arasi.png'));
}
if (patatesFile) {
    fs.copyFileSync(path.join(artifactDir, patatesFile), path.join(destDir, 'patates_kapta.png'));
}

// 2. Modify index.html
let html = fs.readFileSync('index.html', 'utf8');

// Replace "Ekmek Arası Tavuk İncik" image (it probably currently uses durum.png or burger.png)
// I will target the exact names "Ekmek Arası Tavuk İncik" and "Ekmek Arası Satır Köfte" and "Patates Kızartması"
// However, since they are inside the list-item block, we can just replace their image tags.
// But we need to make sure we don't accidentally replace the wrong images.
// Let's use regex with negative lookbehind/lookahead or just replace the generic img src right before the title.

html = html.replace(/(<img src="images\/)[^"]+(" alt="Ekmek Arası Tavuk İncik")/g, '$1ekmek_arasi.png$2');
html = html.replace(/(<img src="images\/)[^"]+(" alt="Ekmek Arası Satır Köfte")/g, '$1ekmek_arasi.png$2');
html = html.replace(/(<img src="images\/)[^"]+(" alt="Patates Kızartması")/g, '$1patates_kapta.png$2');

fs.writeFileSync('index.html', html);

// 3. Modify style.css
let css = fs.readFileSync('css/style.css', 'utf8');
if (!css.includes('::-webkit-scrollbar')) {
    css += `
/* CUSTOM SCROLLBAR */
::-webkit-scrollbar {
    width: 10px;
}
::-webkit-scrollbar-track {
    background: var(--bg-dark);
}
::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
    background: var(--accent-color);
}
`;
    fs.writeFileSync('css/style.css', css);
}

console.log('Images moved, HTML updated, and scrollbar CSS applied!');
