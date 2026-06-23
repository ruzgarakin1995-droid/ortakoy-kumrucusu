const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let css = fs.readFileSync('css/style.css', 'utf8');
let js = fs.readFileSync('js/app.js', 'utf8');

// 1. Add HTML components before </body>
const checkoutHtml = `
    <!-- Floating Cart Button -->
    <div class="floating-cart-btn" id="floatingCartBtn">
        <div class="cart-count">1</div>
        <div class="cart-text">Siparişi Gör</div>
        <div class="cart-price">• 590₺</div>
    </div>

    <!-- Checkout Modal / Bottom Sheet -->
    <div class="checkout-overlay" id="checkoutModal">
        <div class="checkout-sheet">
            <div class="sheet-header">
                <h3><i class="fa-solid fa-cart-shopping"></i> Sipariş Listem</h3>
                <button class="close-sheet" id="closeCheckout"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
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
                    <span>Ort. Teslimat Tutarı: 60₺</span>
                </div>
                
                <!-- Payment Methods -->
                <h4 class="section-title"><i class="fa-solid fa-credit-card"></i> Ödeme Yöntemi</h4>
                <div class="payment-methods">
                    <div class="payment-method active"><i class="fa-solid fa-money-bill-wave"></i> Nakit</div>
                    <div class="payment-method"><i class="fa-solid fa-credit-card"></i> Kart</div>
                </div>
                
                <!-- Delivery Info -->
                <h4 class="section-title"><i class="fa-solid fa-map-pin"></i> Teslimat Bilgileri</h4>
                <div class="form-group">
                    <input type="text" placeholder="Ad Soyad" class="form-control">
                </div>
                <div class="form-group">
                    <input type="tel" placeholder="Telefon Numarası" class="form-control">
                </div>
                <div class="form-group">
                    <input type="text" placeholder="Adres (Mahalle, Sokak, Bina No, Daire)" class="form-control">
                </div>
                <div class="form-group">
                    <input type="text" placeholder="Sipariş Notu (opsiyonel)" class="form-control">
                </div>
                
                <!-- Coupon -->
                <div class="coupon-box">
                    <h4 class="section-title"><i class="fa-solid fa-ticket"></i> Kupon Kodu</h4>
                    <div class="coupon-input-group">
                        <input type="text" placeholder="KUPON KODUNUZU GİRİNİZ" class="form-control">
                        <button class="btn-apply">Uygula</button>
                    </div>
                </div>
            </div>
            
            <div class="sheet-footer">
                <button class="btn-submit-order"><i class="fa-solid fa-motorcycle"></i> Sipariş Ver</button>
            </div>
        </div>
    </div>
</body>`;

if (!html.includes('floating-cart-btn')) {
    html = html.replace('</body>', checkoutHtml);
    fs.writeFileSync('index.html', html);
}

// 2. Add CSS
const checkoutCss = `
/* Floating Cart Button */
.floating-cart-btn {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    width: 90%;
    max-width: 400px;
    background: #b87a00;
    color: white;
    border-radius: 30px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    z-index: 1000;
    cursor: pointer;
    font-weight: 700;
    font-size: 16px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.floating-cart-btn.visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(-50%) translateY(0);
}

.cart-count {
    background: white;
    color: #b87a00;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.cart-text {
    flex-grow: 1;
    text-align: left;
    margin-left: 12px;
}

.cart-price {
    font-size: 15px;
}

/* Checkout Modal / Bottom Sheet */
.checkout-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 2000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.checkout-overlay.active {
    opacity: 1;
    pointer-events: auto;
}

.checkout-sheet {
    background: #fff;
    color: #333;
    width: 100%;
    max-width: 600px;
    border-radius: 24px 24px 0 0;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.checkout-overlay.active .checkout-sheet {
    transform: translateY(0);
}

.sheet-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
}

.sheet-header h3 {
    margin: 0;
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #111;
}

.close-sheet {
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    transition: color 0.2s;
}

.close-sheet:hover {
    color: #333;
}

.sheet-body {
    padding: 20px;
    overflow-y: auto;
}

.cart-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 16px;
    color: #111;
    padding-bottom: 16px;
    border-bottom: 1px dashed #ddd;
}

.cart-item-price {
    font-weight: 700;
    color: #b87a00;
    display: flex;
    align-items: center;
    gap: 12px;
}

.remove-item {
    color: #ff4d4f;
    cursor: pointer;
}

.cart-total-row {
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    font-weight: 800;
    color: #111;
    margin-bottom: 16px;
}

.delivery-notice {
    background: #f8f9fa;
    padding: 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #666;
    margin-bottom: 24px;
}

.delivery-notice i {
    color: #ff4d4f;
    margin-right: 4px;
}

.delivery-notice span {
    display: block;
    font-size: 11px;
    color: #999;
    margin-top: 4px;
    font-weight: 400;
    font-style: italic;
}

.section-title {
    font-size: 15px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #111;
    font-weight: 700;
}

.section-title i {
    color: #3ca2e0;
}

.payment-methods {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
}

.payment-method {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    font-weight: 600;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.payment-method i {
    color: #555;
}

.payment-method.active {
    background: #b87a00;
    color: white;
    border-color: #b87a00;
}

.payment-method.active i {
    color: #4CAF50;
}

.form-group {
    margin-bottom: 12px;
}

.form-control {
    width: 100%;
    padding: 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    color: #333;
    background: #fff;
    outline: none;
    transition: border-color 0.2s;
}

.form-control:focus {
    border-color: #b87a00;
}

.coupon-box {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 24px;
    margin-top: 24px;
}

.coupon-box .section-title i {
    color: #e91e63;
}

.coupon-input-group {
    display: flex;
    gap: 8px;
}

.coupon-input-group .form-control {
    margin-bottom: 0;
}

.btn-apply {
    background: #b87a00;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 20px;
    font-weight: 700;
    cursor: pointer;
}

.sheet-footer {
    padding: 16px 20px;
    border-top: 1px solid #eee;
    background: #fff;
    border-radius: 0 0 20px 20px;
}

.btn-submit-order {
    width: 100%;
    background: #b87a00;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 16px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}
`;

if (!css.includes('.checkout-sheet')) {
    css += '\\n' + checkoutCss;
    fs.writeFileSync('css/style.css', css);
}

// 3. Add JS
const checkoutJs = `
    // Checkout UI Logic
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckout = document.getElementById('closeCheckout');
    const addButtons = document.querySelectorAll('.btn-add, .btn-add-small');
    const paymentMethods = document.querySelectorAll('.payment-method');

    // Show floating button when add is clicked
    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // prevent default behavior
            floatingCartBtn.classList.add('visible');
            
            // Pop animation on button
            btn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Open Modal
    if(floatingCartBtn) {
        floatingCartBtn.addEventListener('click', () => {
            checkoutModal.classList.add('active');
            floatingCartBtn.classList.remove('visible'); // hide button while modal is open
        });
    }

    // Close Modal
    if(closeCheckout) {
        closeCheckout.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
            floatingCartBtn.classList.add('visible'); // show button again
        });
    }
    
    // Close Modal on background click
    if(checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if(e.target === checkoutModal) {
                checkoutModal.classList.remove('active');
                floatingCartBtn.classList.add('visible');
            }
        });
    }

    // Payment Method Selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('active'));
            method.classList.add('active');
        });
    });
`;

if (!js.includes('checkoutModal')) {
    js = js.replace('});', checkoutJs + '\\n});');
    fs.writeFileSync('js/app.js', js);
}

console.log('Checkout implemented');
