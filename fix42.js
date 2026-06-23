const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The target we want to replace is the `<div class="checkout-actions"...> ... </div>` section.
// Let's use a regex to replace everything from `<div class="checkout-actions"` down to just before `</div>` (which closes the sheet-body).
const newCheckoutActionsHTML = `
                <div class="checkout-actions" id="checkoutActions" style="display: none;">
                    
                    <div class="checkout-form">
                        <div class="form-group">
                            <input type="text" id="customerName" placeholder=" " required>
                            <label for="customerName">İsim Soyisim</label>
                        </div>
                        <div class="form-group">
                            <input type="tel" id="customerPhone" placeholder=" " required>
                            <label for="customerPhone">Telefon Numarası</label>
                        </div>
                        <div class="form-group">
                            <textarea id="customerAddress" placeholder=" " rows="2" required></textarea>
                            <label for="customerAddress">Teslimat Adresi</label>
                        </div>
                        <div class="form-group">
                            <textarea id="orderNotes" placeholder=" " rows="2"></textarea>
                            <label for="orderNotes">Sipariş Notu (İsteğe bağlı)</label>
                        </div>
                    </div>

                    <div class="payment-section">
                        <h4>Ödeme Yöntemi</h4>
                        <div class="payment-methods">
                            <button class="payment-method active"><i class="fa-solid fa-money-bill"></i> Nakit</button>
                            <button class="payment-method"><i class="fa-solid fa-credit-card"></i> Kredi Kartı</button>
                        </div>
                    </div>
                    
                    <button class="btn-checkout-premium" id="btnCompleteOrder">Siparişi Tamamla <i class="fa-solid fa-arrow-right"></i></button>
                </div>`;

html = html.replace(/<div class="checkout-actions" id="checkoutActions" style="display: none;">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/body>/, newCheckoutActionsHTML + '\n            </div>\n        </div>\n    </div>\n</body>');

fs.writeFileSync('index.html', html);


let css = fs.readFileSync('css/style.css', 'utf8');

// I will just append the premium checkout CSS. I'll make sure to override anything that might conflict.
const premiumCheckoutCSS = `
/* --- Premium Checkout Actions CSS --- */
.sheet-body {
    overflow-y: auto;
    padding-right: 5px;
    padding-bottom: 20px;
}
.sheet-body::-webkit-scrollbar {
    width: 6px;
}
.sheet-body::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}
.sheet-body::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 4px;
}

.checkout-actions {
    margin-top: 25px;
    padding-top: 25px;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    gap: 24px;
}
.checkout-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.form-group {
    position: relative;
}
.form-group input, .form-group textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px;
    padding: 24px 16px 8px 16px !important;
    color: #fff;
    font-size: 15px;
    font-family: inherit;
    transition: border-color 0.3s, box-shadow 0.3s;
    box-sizing: border-box;
}
.form-group textarea {
    resize: none;
    min-height: 80px;
}
.form-group input:focus, .form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 4px rgba(255, 193, 7, 0.1);
    background: rgba(255, 255, 255, 0.05) !important;
}
.form-group label {
    position: absolute;
    left: 16px;
    top: 18px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 15px;
    pointer-events: none;
    transition: 0.2s ease all;
}
.form-group input:focus ~ label, .form-group input:not(:placeholder-shown) ~ label,
.form-group textarea:focus ~ label, .form-group textarea:not(:placeholder-shown) ~ label {
    top: 8px;
    font-size: 11px;
    color: var(--primary-color);
    font-weight: 600;
}
.payment-section h4 {
    margin-bottom: 12px;
    color: rgba(255,255,255,0.7);
    font-size: 14px;
    font-weight: 500;
}
.payment-methods {
    display: flex;
    gap: 12px;
}
.payment-method {
    flex: 1;
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: rgba(255,255,255,0.7) !important;
    padding: 16px !important;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: inherit;
    font-size: 15px;
}
.payment-method:hover {
    background: rgba(255, 255, 255, 0.08) !important;
}
.payment-method.active {
    background: rgba(255, 193, 7, 0.15) !important;
    border-color: var(--primary-color) !important;
    color: var(--primary-color) !important;
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.1);
}
.btn-checkout-premium {
    width: 100%;
    background: linear-gradient(135deg, var(--primary-color) 0%, #FFA000 100%);
    color: #111;
    border: none;
    padding: 18px;
    border-radius: 16px;
    font-size: 18px;
    font-weight: 800;
    cursor: pointer;
    text-transform: uppercase;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-family: inherit;
    letter-spacing: 0.5px;
    margin-top: 10px;
}
.btn-checkout-premium:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(255, 193, 7, 0.4);
}
.btn-checkout-premium:active {
    transform: translateY(1px);
    box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3);
}
`;

fs.writeFileSync('css/style.css', css + premiumCheckoutCSS);

// Let's also verify app.js has no problems, the payment method logic still binds correctly.
// app.js selects \`.payment-method\` which I have kept.

console.log('Fixed completely with premium CSS');
