const fs = require('fs');

// 1. Fix CSS
let css = fs.readFileSync('css/style.css', 'utf8');
css = css.replace(
    /\.checkout-overlay\.active \{[\s\S]*?\}/,
    `.checkout-overlay.active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}`
);
fs.writeFileSync('css/style.css', css);

// 2. Fix JS
let js = fs.readFileSync('js/app.js', 'utf8');

const badLogic = `        // Update floating button badge
        if (floatingCartBtn) {
            const badge = floatingCartBtn.querySelector('.cart-badge');
            if (badge) {
                badge.textContent = cart.length;
            }
        }`;

const goodLogic = `        // Update floating button badge and price
        if (floatingCartBtn) {
            const badge = floatingCartBtn.querySelector('.cart-count');
            if (badge) {
                badge.textContent = cart.length;
            }
            const priceLabel = floatingCartBtn.querySelector('.cart-price');
            if (priceLabel) {
                priceLabel.textContent = '• ' + total + '₺';
            }
        }`;

js = js.replace(badLogic, goodLogic);

// Also let's double check floating button display logic.
// When modal opens, we hide the floating button. When it closes, we show it.
// However, the floating button was getting \`display: flex\` or \`display: none\` via JS in renderCart:
/*
        if (cart.length === 0) {
            ...
            if(floatingCartBtn) floatingCartBtn.style.display = 'none';
        } else {
            ...
            if(floatingCartBtn) floatingCartBtn.style.display = 'flex';
        }
*/
// But floatingCartBtn also has a 'visible' class in CSS:
// \`.floating-cart-btn.visible { transform: translateY(0); }\`
// Wait, \`display: flex\` overrides the CSS maybe? Actually, adding \`display: none\` makes it disappear permanently if we're not careful.
// Let's replace the inline \`style.display\` with adding/removing the 'visible' class correctly, or just let CSS handle visibility.
// Actually, in \`renderCart()\`:
// if(floatingCartBtn) floatingCartBtn.classList.remove('visible');
// if(floatingCartBtn) floatingCartBtn.classList.add('visible');
js = js.replace(/if\(floatingCartBtn\) floatingCartBtn\.style\.display = 'none';/g, "if(floatingCartBtn) floatingCartBtn.classList.remove('visible');");
js = js.replace(/if\(floatingCartBtn\) floatingCartBtn\.style\.display = 'flex';/g, "if(floatingCartBtn && !checkoutModal.classList.contains('active')) floatingCartBtn.classList.add('visible');");

fs.writeFileSync('js/app.js', js);
console.log('Fixed floating cart display and CSS visibility.');
