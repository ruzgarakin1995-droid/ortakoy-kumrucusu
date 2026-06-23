const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\egem2\\.gemini\\antigravity\\brain\\41618512-b5f3-4f1d-83c8-e091389e90ca';
const destDir = 'c:/Users/egem2/Desktop/ortakoy-kumrucusu/images';

const files = fs.readdirSync(artifactDir);

const mapping = {
    'nescafe_': 'nescafe.png',
    'latte_': 'latte.png',
    'americano_': 'americano.png',
    'sicak_cikolata_': 'sicak_cikolata.png',
    'turk_kahvesi_': 'turk_kahvesi.png'
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

// 1. Fix the Bardakta Waffle HTML glitch
html = html.replace(/alt="Bardakta Waffle><\/div>/g, 'alt="Bardakta Waffle"></div>');
// Wait, the ingredients icons were lost too? The user said "ürün içerik sembolleri de gitmiş".
// If the original html didn't have ingredient icons for Bardakta Tatlı, we can add them.
// Let's add them back if they were lost.
if (!html.includes('<div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü">') && html.indexOf('<h3>Bardakta Waffle</h3>') !== -1) {
    // I will use a simple regex to replace the ingredients for Bardakta Waffle
    html = html.replace(
        /(<h3>Bardakta Waffle<\/h3><p class="item-ingredients">.*?<\/p>)(<\/div>)/,
        '$1\n                    <div class="ingredient-icons">\n                        <div class="ing-icon ing-sut" tabindex="0" title="Süt Ürünü"><i class="fa-solid fa-bottle-droplet"></i></div>\n                        <div class="ing-icon ing-tahil" tabindex="0" title="Tahıl / Gluten"><i class="fa-solid fa-wheat-awn"></i></div>\n                    </div>$2'
    );
}

// 2. Replace the image sources for the coffees
// Usually they might be pointing to "cay.png" or similar. We match by alt text or title.
// For Nescafe
html = html.replace(/(<img src="images\/)[^"]+(" alt="Nescafe")/g, '$1nescafe.png$2');

// Latte
html = html.replace(/(<img src="images\/)[^"]+(" alt="Latte")/g, '$1latte.png$2');

// Americano or Amerikano
html = html.replace(/(<img src="images\/)[^"]+(" alt="Americ?ano")/g, '$1americano.png$2');

// Sıcak Çikolata
html = html.replace(/(<img src="images\/)[^"]+(" alt="Sıcak Çikolata")/g, '$1sicak_cikolata.png$2');

// Türk Kahvesi
html = html.replace(/(<img src="images\/)[^"]+(" alt="Türk Kahvesi")/g, '$1turk_kahvesi.png$2');

fs.writeFileSync('index.html', html);
console.log('HTML updated and images copied!');
