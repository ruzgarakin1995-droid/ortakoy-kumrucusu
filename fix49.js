const fs = require('fs');

let js = fs.readFileSync('js/app.js', 'utf8');

const newExtractItemInfo = `    function extractItemInfo(btn) {
        let title = 'Ürün';
        let price = 0;

        try {
            let current = btn.parentElement;
            let container = null;
            
            while (current && current !== document.body) {
                const titleEl = current.querySelector('h3, .featured-title, .card-title, .banner-title');
                const priceEl = current.querySelector('.list-item-price, .featured-price, .card-price, .price');
                
                if (titleEl && (priceEl || current.textContent.match(/\\d+\\s*₺/))) {
                    container = current;
                    break;
                }
                current = current.parentElement;
            }

            if (container) {
                const titleEl = container.querySelector('h3, .featured-title, .card-title, .banner-title');
                if (titleEl) {
                    title = titleEl.textContent.replace('👑', '').replace('🍔', '').replace('🌭', '').trim();
                }

                const priceEl = container.querySelector('.list-item-price, .featured-price, .card-price, .price');
                if (priceEl) {
                    price = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
                } else {
                    const match = container.textContent.match(/(\\d+)\\s*₺/);
                    if (match) price = parseInt(match[1]);
                }
            }
        } catch(e) {
            console.error(e);
        }

        return { title, price };
    }`;

js = js.replace(/function extractItemInfo\(btn\) \{[\s\S]*?return \{ title, price \};\n    \}/, newExtractItemInfo);

fs.writeFileSync('js/app.js', js);
console.log('Fixed extractItemInfo to dynamically find any container.');
