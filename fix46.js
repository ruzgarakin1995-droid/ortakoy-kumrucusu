const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const newCompactCheckoutHTML = `
        <div class="checkout-sheet single-page-compact">
            <div class="sheet-header compact-header">
                <h3><i class="fa-solid fa-cart-shopping"></i> Sipariş Listem</h3>
                <i class="fa-solid fa-xmark close-sheet" id="closeCheckout"></i>
            </div>
            
            <div class="sheet-body compact-body">
                <div id="cartItemsContainer" class="compact-cart-items">
                    <!-- Items will be dynamically inserted here -->
                </div>
                
                <div class="cart-empty-state" id="cartEmptyState">
                    <i class="fa-solid fa-basket-shopping" style="font-size: 2.5rem; color: rgba(255,255,255,0.2); margin-bottom: 10px;"></i>
                    <p style="font-size: 14px; margin:0;">Sepetiniz boş.</p>
                </div>
                
                <div class="cart-total-row compact-total" id="cartTotalRow" style="display: none;">
                    <strong>Toplam</strong>
                    <strong id="cartTotalPrice">0 ₺</strong>
                </div>
                
                <div class="delivery-notice compact-notice" id="deliveryNotice" style="display: none;">
                    <i class="fa-solid fa-motorcycle"></i> <span id="deliveryText">600 ₺ üzeri siparişlerde teslimat ücretsiz!</span>
                </div>

                <div class="checkout-actions compact-actions" id="checkoutActions" style="display: none;">
                    <div class="checkout-form compact-form">
                        <div class="form-row">
                            <div class="form-group">
                                <input type="text" id="customerName" placeholder=" " required>
                                <label for="customerName">İsim Soyisim</label>
                            </div>
                            <div class="form-group">
                                <input type="tel" id="customerPhone" placeholder=" " required>
                                <label for="customerPhone">Telefon</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <input type="text" id="customerAddress" placeholder=" " required>
                            <label for="customerAddress">Teslimat Adresi</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="orderNotes" placeholder=" ">
                            <label for="orderNotes">Sipariş Notu</label>
                        </div>
                    </div>

                    <div class="payment-methods compact-payment">
                        <button class="payment-method active"><i class="fa-solid fa-money-bill"></i> Nakit</button>
                        <button class="payment-method"><i class="fa-solid fa-credit-card"></i> Kredi Kartı</button>
                    </div>
                    
                    <button class="btn-checkout-premium compact-btn" id="btnCompleteOrder">Siparişi Tamamla <i class="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>
        </div>
`;

// Replace from <div class="checkout-sheet"> to the closing </div> of the sheet
html = html.replace(/<div class="checkout-sheet">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/body>/, newCompactCheckoutHTML + '\n    </div>\n\n' + 
`    <!-- Edit Item Modal -->
    <div class="edit-item-overlay" id="editItemModal">
        <div class="edit-item-sheet">
            <div class="edit-header">
                <h4>Ürün Malzemeleri</h4>
                <i class="fa-solid fa-xmark close-edit" id="closeEditModal"></i>
            </div>
            <div class="edit-body" id="editIngredientsList">
                <!-- Ingredients will be inserted here dynamically -->
            </div>
            <div class="edit-footer">
                <button class="btn-checkout-premium" id="btnSaveEdit">Kaydet</button>
            </div>
        </div>
    </div>\n</body>`);

fs.writeFileSync('index.html', html);


// CSS updates
let css = fs.readFileSync('css/style.css', 'utf8');

const compactCSS = `
/* --- Single Page Compact Checkout --- */
.single-page-compact {
    max-height: 90vh !important;
    display: flex;
    flex-direction: column;
    padding: 15px !important;
}
.compact-header {
    padding: 10px 5px !important;
    margin-bottom: 5px;
}
.compact-header h3 {
    font-size: 16px !important;
}
.compact-body {
    display: flex;
    flex-direction: column;
    overflow: hidden !important; /* The body itself shouldn't scroll */
    flex: 1;
}
.compact-cart-items {
    flex: 1;
    overflow-y: auto;
    min-height: 50px;
    padding-right: 5px;
}
.compact-cart-items::-webkit-scrollbar { display: none; }
.compact-cart-items { -ms-overflow-style: none; scrollbar-width: none; }

.cart-item {
    padding: 8px 0 !important;
}
.cart-item-info {
    font-size: 14px;
}
.btn-edit-item {
    padding: 4px 8px !important;
    font-size: 11px !important;
}

.compact-total {
    margin: 8px 0 !important;
    padding-top: 8px !important;
    font-size: 1.1rem !important;
}
.compact-notice {
    padding: 8px !important;
    margin-bottom: 10px !important;
    font-size: 0.8rem !important;
}

.compact-actions {
    margin-top: 5px !important;
    padding-top: 10px !important;
    gap: 10px !important;
}
.compact-form {
    gap: 8px !important;
}
.form-row {
    display: flex;
    gap: 8px;
}
.form-row .form-group {
    flex: 1;
}
.compact-form .form-group input {
    padding: 16px 12px 4px 12px !important;
    border-radius: 8px !important;
    font-size: 13px !important;
    height: 42px;
}
.compact-form .form-group label {
    top: 12px !important;
    left: 12px !important;
    font-size: 13px !important;
}
.compact-form .form-group input:focus ~ label, 
.compact-form .form-group input:not(:placeholder-shown) ~ label {
    top: 4px !important;
    font-size: 10px !important;
}
.compact-payment {
    margin-bottom: 5px !important;
    gap: 8px !important;
}
.compact-payment .payment-method {
    padding: 8px !important;
    font-size: 13px !important;
    border-radius: 8px !important;
}
.compact-btn {
    padding: 12px !important;
    font-size: 15px !important;
    border-radius: 10px !important;
    margin-top: 5px !important;
}
`;

fs.writeFileSync('css/style.css', css + compactCSS);


// Update app.js to remove slider logic and fix empty state
let js = fs.readFileSync('js/app.js', 'utf8');

// Remove step1Footer refs
js = js.replace(/const step1Footer = document\.getElementById\('step1Footer'\);/g, "const checkoutActions = document.getElementById('checkoutActions');");
js = js.replace(/if \(step1Footer\) step1Footer\.style\.display = 'none';/g, "if (checkoutActions) checkoutActions.style.display = 'none';");
js = js.replace(/if \(step1Footer\) step1Footer\.style\.display = 'block';/g, "if (checkoutActions) checkoutActions.style.display = 'flex';");

fs.writeFileSync('js/app.js', js);
console.log('Single page compact checkout completed.');
