const fs = require('fs');

let js = fs.readFileSync('js/app.js', 'utf8');

// We need to inject the multi-step slider logic and item edit modal logic.
// We'll append it just before the `});` at the end.
const additionalJS = `
    // --- 2-Step Checkout Wizard Logic ---
    const checkoutSlider = document.getElementById('checkoutSlider');
    const btnNextStep = document.getElementById('btnNextStep');
    const btnPrevStep = document.getElementById('btnPrevStep');
    const step1Footer = document.getElementById('step1Footer');

    if (btnNextStep) {
        btnNextStep.addEventListener('click', () => {
            if(cart.length > 0) {
                checkoutSlider.classList.add('step-2-active');
            }
        });
    }

    if (btnPrevStep) {
        btnPrevStep.addEventListener('click', () => {
            checkoutSlider.classList.remove('step-2-active');
        });
    }

    // Always reset to step 1 when modal is opened/closed
    function resetCheckoutSteps() {
        if (checkoutSlider) checkoutSlider.classList.remove('step-2-active');
    }

    // Redefine checkout modal event listener if exists to attach reset
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', () => {
            resetCheckoutSteps();
        });
    }

    // --- Ingredients Edit Modal Logic ---
    const editItemModal = document.getElementById('editItemModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const btnSaveEdit = document.getElementById('btnSaveEdit');
    const editIngredientsList = document.getElementById('editIngredientsList');
    
    let currentlyEditingIndex = null;

    // Standard ingredients for a fast-food product
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

    // We make openEditModal global so it can be called from dynamically rendered HTML
    window.openEditModal = function(index) {
        currentlyEditingIndex = index;
        const item = cart[index];
        
        editIngredientsList.innerHTML = '';
        
        const currentExcluded = item.excludedIngredients || [];
        
        // We will generate the same standard ingredients for all items for demo purposes
        standardIngredients.forEach(ing => {
            const isChecked = !currentExcluded.includes(ing);
            
            const row = document.createElement('div');
            row.className = 'ingredient-row';
            row.innerHTML = \`
                <span class="ingredient-name">\${ing}</span>
                <label class="switch">
                    <input type="checkbox" value="\${ing}" \${isChecked ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            \`;
            editIngredientsList.appendChild(row);
        });

        editItemModal.classList.add('active');
    };
`;

js = js.replace(/}\);$/, additionalJS + '\n});');

// Now we must redefine how `renderCart` generates the cart HTML to include the "Düzenle" button and the excluded items text.
const oldRenderCartHTML = `cartItemEl.innerHTML = \\\`
                <div class="cart-item-info">\\\${item.title}</div>
                <div class="cart-item-price">\\\${item.price} ₺ <i class="fa-solid fa-xmark remove-item" data-index="\\\${index}" style="cursor:pointer; margin-left: 10px; color: rgba(255,255,255,0.5);"></i></div>
            \\\`;`;

const newRenderCartHTML = `
            let notesHtml = '';
            if (item.excludedIngredients && item.excludedIngredients.length > 0) {
                notesHtml = \`<div class="cart-item-notes">İstemiyor: \${item.excludedIngredients.join(', ')}</div>\`;
            }

            cartItemEl.innerHTML = \`
                <div class="cart-item-top">
                    <div class="cart-item-info">\${item.title}</div>
                    <div class="cart-item-actions">
                        <button class="btn-edit-item" onclick="openEditModal(\${index})"><i class="fa-solid fa-pen"></i> Düzenle</button>
                        <div class="cart-item-price">\${item.price} ₺ <i class="fa-solid fa-xmark remove-item" data-index="\${index}" style="cursor:pointer; margin-left: 10px; color: rgba(255,255,255,0.5);"></i></div>
                    </div>
                </div>
                \${notesHtml}
            \`;
`;
js = js.replace(oldRenderCartHTML, newRenderCartHTML);

// We also need to fix empty state display logic to handle step1Footer
const oldEmptyStateLogic = `        const checkoutActions = document.getElementById('checkoutActions');
        if (cart.length === 0) {
            cartEmptyState.style.display = 'flex';
            cartTotalRow.style.display = 'none';
            deliveryNotice.style.display = 'none';
            if (checkoutActions) checkoutActions.style.display = 'none';
            if(floatingCartBtn) floatingCartBtn.classList.remove('visible');
        } else {
            cartEmptyState.style.display = 'none';
            cartTotalRow.style.display = 'flex';
            deliveryNotice.style.display = 'flex';
            if (checkoutActions) checkoutActions.style.display = 'block';
            if(floatingCartBtn && !checkoutModal.classList.contains('active')) floatingCartBtn.classList.add('visible');
        }`;

const newEmptyStateLogic = `        const step1Footer = document.getElementById('step1Footer');
        if (cart.length === 0) {
            cartEmptyState.style.display = 'flex';
            cartTotalRow.style.display = 'none';
            deliveryNotice.style.display = 'none';
            if (step1Footer) step1Footer.style.display = 'none';
            if(floatingCartBtn) floatingCartBtn.classList.remove('visible');
            // Force reset to step 1 if cart is empty
            const slider = document.getElementById('checkoutSlider');
            if(slider) slider.classList.remove('step-2-active');
        } else {
            cartEmptyState.style.display = 'none';
            cartTotalRow.style.display = 'flex';
            deliveryNotice.style.display = 'flex';
            if (step1Footer) step1Footer.style.display = 'block';
            if(floatingCartBtn && !checkoutModal.classList.contains('active')) floatingCartBtn.classList.add('visible');
        }`;

js = js.replace(oldEmptyStateLogic, newEmptyStateLogic);

fs.writeFileSync('js/app.js', js);
console.log('app.js updated with slider steps and ingredient edit logic.');
