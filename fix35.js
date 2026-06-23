const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\egem2\\.gemini\\antigravity\\brain\\41618512-b5f3-4f1d-83c8-e091389e90ca';
const destDir = 'c:/Users/egem2/Desktop/ortakoy-kumrucusu/images';

const files = fs.readdirSync(artifactDir);

const mapping = {
    'porsiyon_': 'porsiyon.png',
    'waffle_kase_': 'waffle_kase.png',
    'waffle_bardak_': 'waffle_bardak.png',
    'bitki_cayi_': 'bitki_cayi.png',
    'karadut_suyu_': 'karadut_suyu.png',
    'sade_soda_': 'sade_soda.png',
    'churchill_icecek_': 'churchill.png'
};

Object.entries(mapping).forEach(([prefix, outName]) => {
    const file = files.find(f => f.startsWith(prefix) && f.endsWith('.png'));
    if (file) {
        fs.copyFileSync(path.join(artifactDir, file), path.join(destDir, outName));
        console.log(`Copied ${outName}`);
    } else {
        console.log(`Missing ${prefix}`);
    }
});

let html = fs.readFileSync('index.html', 'utf8');

// Replacements in HTML
html = html.replace(/(<h3[^>]*>)Bardakta Tatlı(<\/h3>)/g, '$1Bardakta Waffle$2');

// Porsiyon
html = html.replace(/(<img src="images\/)[^"]+(" alt="Kasap Köfte Porsiyon")/g, '$1porsiyon.png$2');
html = html.replace(/(<img src="images\/)[^"]+(" alt="Tavuk İncik Porsiyon")/g, '$1porsiyon.png$2');

// Kasede Waffle (Wait, the alt text is "Kasede Waffle" or "Kasede waffle"?)
// Let's use a regex that matches variations.
html = html.replace(/(<img src="images\/)[^"]+(" alt="Kasede [Ww]affle")/g, '$1waffle_kase.png$2');

// Bardakta Waffle
html = html.replace(/(<img src="images\/)[^"]+(" alt="Bardakta Tatlı")/g, '$1waffle_bardak.png" alt="Bardakta Waffle');
html = html.replace(/(<img src="images\/)[^"]+(" alt="Bardakta Waffle")/g, '$1waffle_bardak.png$2');

// Bitki Çayı
html = html.replace(/(<img src="images\/)[^"]+(" alt="Bitki Çayı")/g, '$1bitki_cayi.png$2');

// Karadut
html = html.replace(/(<img src="images\/)[^"]+(" alt="Karadut Özü")/g, '$1karadut_suyu.png$2');

// Sade Soda
html = html.replace(/(<img src="images\/)[^"]+(" alt="Sade Soda")/g, '$1sade_soda.png$2');

// Churchill
html = html.replace(/(<img src="images\/)[^"]+(" alt="Churchill")/g, '$1churchill.png$2');

fs.writeFileSync('index.html', html);
console.log('HTML updated!');
