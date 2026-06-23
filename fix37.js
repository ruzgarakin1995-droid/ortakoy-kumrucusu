const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The checkout modal section currently looks like:
/*
            <div class="sheet-body">
                <!-- Cart Item -->
                <div class="cart-item">
                    <div class="cart-item-info">Gamer XL Menü (Star Bazza + 4 Peynirli Bazza + Cola Zero)</div>
                    <div class="cart-item-price">590₺ <i class="fa-solid fa-xmark remove-item"></i></div>
                </div>
                
                <div class="cart-total-row">
                    <strong>Toplam</strong>
                    <strong>590₺</strong>
                </div>
                
                <div class="delivery-notice">
                    <i class="fa-solid fa-motorcycle"></i> 600₺ üzeri siparişlerde teslimat ücretsiz!
                </div>
            </div>
*/

// I want to replace the inside of `sheet-body` with an empty state and a dynamic container.
const newSheetBody = `
            <div class="sheet-body">
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
            </div>`;

html = html.replace(/<div class="sheet-body">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/body>/, newSheetBody + '\n        </div>\n    </div>\n</body>');

// And I'll add "id="checkoutModalBody" just in case we need it, but let's stick to the IDs I added above.
fs.writeFileSync('index.html', html);
console.log('HTML updated for cart empty state.');
