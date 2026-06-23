const fs = require('fs');

// 1. Restore HTML
let html = fs.readFileSync('index.html', 'utf8');

const checkoutActionsHTML = `
                <div class="checkout-actions" id="checkoutActions" style="display: none;">
                    <div class="payment-section">
                        <h4>Ödeme Yöntemi</h4>
                        <div class="payment-methods">
                            <button class="payment-method active"><i class="fa-solid fa-money-bill"></i> Nakit</button>
                            <button class="payment-method"><i class="fa-solid fa-credit-card"></i> Kredi Kartı</button>
                        </div>
                    </div>
                    
                    <div class="order-notes">
                        <textarea placeholder="Sipariş notunuzu buraya ekleyebilirsiniz..."></textarea>
                    </div>
                    
                    <button class="btn-checkout">Siparişi Tamamla</button>
                </div>
            </div>`; // Closing sheet-body

// We will replace the end of sheet-body.
// In the current HTML, it ends with:
// </span>
//                 </div>
//             </div>
html = html.replace(/<div class="delivery-notice" id="deliveryNotice" style="display: none;">[\s\S]*?<\/div>\s*<\/div>/, `<div class="delivery-notice" id="deliveryNotice" style="display: none;">
                    <i class="fa-solid fa-motorcycle"></i> <span id="deliveryText">600 ₺ üzeri siparişlerde teslimat ücretsiz!</span>
                </div>
` + checkoutActionsHTML);

fs.writeFileSync('index.html', html);


// 2. Add CSS
let css = fs.readFileSync('css/style.css', 'utf8');
const missingCSS = `
.checkout-actions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.05);
}
.payment-section h4 {
    margin-bottom: 12px;
    color: rgba(255,255,255,0.7);
    font-size: 14px;
}
.payment-methods {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}
.payment-method {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
.payment-method.active {
    background: rgba(255, 193, 7, 0.1);
    border-color: var(--primary-color);
    color: var(--primary-color);
}
.order-notes textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    color: #fff;
    min-height: 80px;
    resize: none;
    margin-bottom: 20px;
    font-family: inherit;
}
.order-notes textarea:focus {
    outline: none;
    border-color: var(--primary-color);
}
.btn-checkout {
    width: 100%;
    background: var(--primary-color);
    color: #000;
    border: none;
    padding: 16px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}
.btn-checkout:active {
    transform: scale(0.98);
}
`;
if (!css.includes('.payment-method')) {
    fs.writeFileSync('css/style.css', css + missingCSS);
}


// 3. Update app.js
let js = fs.readFileSync('js/app.js', 'utf8');

// Find the lines where we toggle display for cart components
const emptyStateCode = `        if (cart.length === 0) {
            cartEmptyState.style.display = 'flex';
            cartTotalRow.style.display = 'none';
            deliveryNotice.style.display = 'none';`;

const emptyStateReplacement = `        const checkoutActions = document.getElementById('checkoutActions');
        if (cart.length === 0) {
            cartEmptyState.style.display = 'flex';
            cartTotalRow.style.display = 'none';
            deliveryNotice.style.display = 'none';
            if (checkoutActions) checkoutActions.style.display = 'none';`;

js = js.replace(emptyStateCode, emptyStateReplacement);

const fullStateCode = `        cartEmptyState.style.display = 'none';
        cartTotalRow.style.display = 'flex';
        deliveryNotice.style.display = 'flex';`;

const fullStateReplacement = `        cartEmptyState.style.display = 'none';
        cartTotalRow.style.display = 'flex';
        deliveryNotice.style.display = 'flex';
        if (checkoutActions) checkoutActions.style.display = 'block';`;

js = js.replace(fullStateCode, fullStateReplacement);

fs.writeFileSync('js/app.js', js);
console.log('Restored missing checkout HTML/CSS/JS.');
