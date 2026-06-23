const fs = require('fs');

const appJsContent = `document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.menu-section');
    const navContainer = document.querySelector('.nav-container');

    // Smooth scroll for nav items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            // Offset for sticky header
            const headerOffset = 70;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });

    // --- Cart System Logic ---
    let cart = [];
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckout = document.getElementById('closeCheckout');
    
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartEmptyState = document.getElementById('cartEmptyState');
    const cartTotalRow = document.getElementById('cartTotalRow');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const deliveryNotice = document.getElementById('deliveryNotice');
    const deliveryText = document.getElementById('deliveryText');

    // Add animation classes
    cartItemsContainer.classList.add('cart-items-container');

    // All possible add to cart buttons
    const addButtons = document.querySelectorAll('.btn-add, .btn-add-small, .btn-large, .btn-add-large');

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartEmptyState.style.display = 'flex';
            cartTotalRow.style.display = 'none';
            deliveryNotice.style.display = 'none';
            if(floatingCartBtn) floatingCartBtn.style.display = 'none';
            return;
        }

        cartEmptyState.style.display = 'none';
        cartTotalRow.style.display = 'flex';
        deliveryNotice.style.display = 'flex';
        if(floatingCartBtn) floatingCartBtn.style.display = 'flex';

        cart.forEach((item, index) => {
            total += item.price;
            
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            
            cartItemEl.innerHTML = \`
                <div class="cart-item-info">\${item.title}</div>
                <div class="cart-item-price">\${item.price} ₺ <i class="fa-solid fa-xmark remove-item" data-index="\${index}" style="cursor:pointer; margin-left: 10px; color: rgba(255,255,255,0.5);"></i></div>
            \`;
            
            cartItemsContainer.appendChild(cartItemEl);
        });

        cartTotalPrice.textContent = total + ' ₺';

        if (total >= 600) {
            deliveryText.innerHTML = 'Kargonuz bedava! <i class="fa-solid fa-check" style="color:#4caf50;"></i>';
            deliveryNotice.style.background = 'rgba(76, 175, 80, 0.1)';
            deliveryNotice.style.borderColor = 'rgba(76, 175, 80, 0.3)';
            deliveryNotice.style.color = '#4caf50';
        } else {
            const diff = 600 - total;
            deliveryText.textContent = \`\${diff} ₺ daha ekleyin, teslimat ücretsiz olsun!\`;
            deliveryNotice.style.background = 'rgba(255, 193, 7, 0.1)';
            deliveryNotice.style.borderColor = 'rgba(255, 193, 7, 0.2)';
            deliveryNotice.style.color = 'var(--primary-color)';
        }

        // Attach remove events
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                cart.splice(idx, 1);
                renderCart();
            });
        });
        
        // Update floating button badge
        if (floatingCartBtn) {
            const badge = floatingCartBtn.querySelector('.cart-badge');
            if (badge) {
                badge.textContent = cart.length;
            }
        }
    }

    // Helper to find closest parent and extract info
    function extractItemInfo(btn) {
        let title = 'Ürün';
        let price = 0;

        // Check if it's a list item
        const listItem = btn.closest('.list-item');
        if (listItem) {
            const titleEl = listItem.querySelector('h3');
            const priceEl = listItem.querySelector('.list-item-price');
            if (titleEl) title = titleEl.textContent;
            if (priceEl) price = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
            return { title, price };
        }

        // Check if it's a category featured card
        const categoryFeatured = btn.closest('.category-featured');
        if (categoryFeatured) {
            const titleEl = categoryFeatured.querySelector('.featured-title');
            const priceEl = categoryFeatured.querySelector('.featured-price');
            if (titleEl) title = titleEl.textContent;
            if (priceEl) price = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
            return { title, price };
        }

        // Check if it's a top banner
        const banner = btn.closest('.banner-content');
        if (banner) {
            const titleEl = banner.querySelector('.banner-title');
            if (titleEl) {
                title = titleEl.textContent.replace('👑 ', '').replace('🍔 ', '').replace('🌭 ', '');
            }
            // Banner price is tricky, maybe it's in a sibling or inside the title?
            // Usually banners have a price tag. Let's look for something with '₺'.
            const textContent = banner.textContent;
            const priceMatch = textContent.match(/(\\d+)\\s*₺/);
            if (priceMatch) {
                price = parseInt(priceMatch[1]);
            } else {
                price = 250; // Fallback
            }
            return { title, price };
        }

        return { title, price };
    }

    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const info = extractItemInfo(btn);
            if (info.price > 0) {
                cart.push(info);
                renderCart();
            }

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
            floatingCartBtn.classList.remove('visible');
        });
    }

    // Close Modal
    if(closeCheckout) {
        closeCheckout.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
            if(cart.length > 0) {
                floatingCartBtn.classList.add('visible');
            }
        });
    }
    
    // Close Modal on background click
    if(checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if(e.target === checkoutModal) {
                checkoutModal.classList.remove('active');
                if(cart.length > 0) {
                    floatingCartBtn.classList.add('visible');
                }
            }
        });
    }

    // Initialize Empty State
    renderCart();

    // Payment Method Selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('active'));
            method.classList.add('active');
        });
    });

    // ScrollSpy to update active nav item
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').substring(1) === current) {
                item.classList.add('active');
                
                const itemLeft = item.offsetLeft;
                const itemWidth = item.offsetWidth;
                const containerWidth = navContainer.offsetWidth;
                const scrollLeft = navContainer.scrollLeft;

                if (itemLeft < scrollLeft || itemLeft + itemWidth > scrollLeft + containerWidth) {
                    navContainer.scrollTo({
                        left: itemLeft - (containerWidth / 2) + (itemWidth / 2),
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    const menuSections = document.querySelectorAll('.menu-section');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            menuSections.forEach(section => {
                let hasVisibleItems = false;
                const items = section.querySelectorAll('.list-item, .category-featured');
                
                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(query)) {
                        item.style.display = ''; 
                        hasVisibleItems = true;
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                if (hasVisibleItems || query === '') {
                    section.style.display = '';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    }
});
`;

fs.writeFileSync('js/app.js', appJsContent);
console.log('app.js updated with dynamic cart logic!');
