const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace the entire contents of .checkout-sheet with the new 2-step structure
const newCheckoutHTML = `
        <div class="checkout-sheet">
            <div class="sheet-header">
                <h3><i class="fa-solid fa-cart-shopping"></i> Sipariş Listem</h3>
                <i class="fa-solid fa-xmark close-sheet" id="closeCheckout"></i>
            </div>
            
            <div class="checkout-slider" id="checkoutSlider">
                
                <!-- STEP 1: CART ITEMS -->
                <div class="checkout-step" id="step1">
                    <div class="sheet-body step-body">
                        <div id="cartItemsContainer">
                            <!-- Items will be dynamically inserted here -->
                        </div>
                        
                        <div class="cart-empty-state" id="cartEmptyState">
                            <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; color: rgba(255,255,255,0.2); margin-bottom: 15px;"></i>
                            <p>Sepetiniz şu an boş.</p>
                        </div>
                        
                        <div class="cart-total-row" id="cartTotalRow" style="display: none;">
                            <strong>Toplam</strong>
                            <strong id="cartTotalPrice">0 ₺</strong>
                        </div>
                        
                        <div class="delivery-notice" id="deliveryNotice" style="display: none;">
                            <i class="fa-solid fa-motorcycle"></i> <span id="deliveryText">600 ₺ üzeri siparişlerde teslimat ücretsiz!</span>
                        </div>
                    </div>
                    
                    <div class="step-footer" id="step1Footer" style="display: none;">
                        <button class="btn-checkout-premium" id="btnNextStep">Siparişi Onayla <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                </div>

                <!-- STEP 2: CHECKOUT FORM -->
                <div class="checkout-step" id="step2">
                    <div class="sheet-body step-body">
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
                    </div>

                    <div class="step-footer">
                        <button class="btn-back" id="btnPrevStep"><i class="fa-solid fa-arrow-left"></i> Geri Dön</button>
                        <button class="btn-checkout-premium" style="flex: 2;" id="btnCompleteOrder">Sipariş Ver <i class="fa-solid fa-check"></i></button>
                    </div>
                </div>

            </div>
        </div>
`;

// Replace from <div class="checkout-sheet"> to the closing </div> of the overlay
html = html.replace(/<div class="checkout-sheet">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/body>/, newCheckoutHTML + '\n    </div>\n\n' + 
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
console.log('HTML updated with slider steps and edit modal.');
