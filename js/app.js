document.addEventListener('DOMContentLoaded', () => {
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

        const checkoutActions = document.getElementById('checkoutActions');
        if (cart.length === 0) {
            cartEmptyState.style.display = 'flex';
            cartTotalRow.style.display = 'none';
            deliveryNotice.style.display = 'none';
            if (checkoutActions) checkoutActions.style.display = 'none';
            if(floatingCartBtn) floatingCartBtn.classList.remove('visible');
            return;
        }

        cartEmptyState.style.display = 'none';
        cartTotalRow.style.display = 'flex';
        deliveryNotice.style.display = 'flex';
        if (checkoutActions) checkoutActions.style.display = 'block';
        if(floatingCartBtn && !checkoutModal.classList.contains('active')) floatingCartBtn.classList.add('visible');

        cart.forEach((item, index) => {
            total += item.price;
            
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            
            let notesHtml = '';
            if (item.excludedIngredients && item.excludedIngredients.length > 0) {
                notesHtml = `<div class="cart-item-notes" style="width: 100%; font-size: 11px; color: rgba(255,255,255,0.4); font-style: italic; margin-top: 4px;">İstemiyor: ${item.excludedIngredients.join(', ')}</div>`;
            }

            cartItemEl.style.flexDirection = 'column';
            cartItemEl.style.alignItems = 'flex-start';

            cartItemEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <div class="cart-item-info">${item.title}</div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button class="btn-edit-item" onclick="openEditModal(${index})"><i class="fa-solid fa-pen"></i> Düzenle</button>
                        <div class="cart-item-price">${item.price} ₺ <i class="fa-solid fa-xmark remove-item" data-index="${index}" style="cursor:pointer; margin-left: 10px; color: rgba(255,255,255,0.5);"></i></div>
                    </div>
                </div>
                ${notesHtml}
            `;
            
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
            deliveryText.textContent = `${diff} ₺ daha ekleyin, teslimat ücretsiz olsun!`;
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
        
        // Update floating button badge and price
        if (floatingCartBtn) {
            const badge = floatingCartBtn.querySelector('.cart-count');
            if (badge) {
                badge.textContent = cart.length;
            }
            const priceLabel = floatingCartBtn.querySelector('.cart-price');
            if (priceLabel) {
                priceLabel.textContent = '• ' + total + '₺';
            }
        }
    }

    // Helper to find closest parent and extract info
            function extractItemInfo(btn) {
        let title = 'Ürün';
        let price = 0;

        try {
            let current = btn.parentElement;
            let container = null;
            
            while (current && current !== document.body) {
                const titleEl = current.querySelector('h3, .featured-title, .card-title, .banner-title');
                const priceEl = current.querySelector('.list-item-price, .featured-price, .card-price, .price');
                
                if (titleEl && (priceEl || current.textContent.match(/\d+\s*₺/))) {
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
                    const match = container.textContent.match(/(\d+)\s*₺/);
                    if (match) price = parseInt(match[1]);
                }
            }
        } catch(e) {
            console.error(e);
        }

        return { title, price };
    }

    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const info = extractItemInfo(btn);
            if (info.price > 0 || info.title) {
                if (info.price === 0) info.price = 100; // Fallback so it doesn't fail silently
                cart.push({ ...info, excludedIngredients: [] }); // Add excluded array properly
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

    // --- Ingredients Edit Modal Logic ---
    const editItemModal = document.getElementById('editItemModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const btnSaveEdit = document.getElementById('btnSaveEdit');
    const editIngredientsList = document.getElementById('editIngredientsList');
    
    let currentlyEditingIndex = null;

    const standardIngredients = [
        "Ketçap", "Mayonez", "Turşu", "Domates", "Marul", "Soğan"
    ];

    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => {
            editItemModal.classList.remove('active');
        });
    }

    if (btnSaveEdit) {
        btnSaveEdit.addEventListener('click', () => {
            if (currentlyEditingIndex !== null) {
                const checkboxes = editIngredientsList.querySelectorAll('input[type="checkbox"]');
                const excluded = [];
                checkboxes.forEach(chk => {
                    if (!chk.checked) {
                        excluded.push(chk.value);
                    }
                });
                cart[currentlyEditingIndex].excludedIngredients = excluded;
                renderCart();
            }
            editItemModal.classList.remove('active');
        });
    }

    window.openEditModal = function(index) {
        currentlyEditingIndex = index;
        const item = cart[index];
        
        editIngredientsList.innerHTML = '';
        const currentExcluded = item.excludedIngredients || [];
        
        standardIngredients.forEach(ing => {
            const isChecked = !currentExcluded.includes(ing);
            const row = document.createElement('div');
            row.className = 'ingredient-row';
            row.innerHTML = `
                <span class="ingredient-name">${ing}</span>
                <label class="switch">
                    <input type="checkbox" value="${ing}" ${isChecked ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            `;
            editIngredientsList.appendChild(row);
        });

        editItemModal.classList.add('active');
    };
});
