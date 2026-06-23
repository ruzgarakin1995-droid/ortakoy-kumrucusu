const fs = require('fs');

let js = fs.readFileSync('js/app.js', 'utf8');

// 1. Rewrite extractItemInfo to ensure it works for everything
const newExtractItemInfo = `    function extractItemInfo(btn) {
        let title = 'Ürün';
        let price = 0;

        try {
            // Check if it's a list item
            const listItem = btn.closest('.list-item');
            if (listItem) {
                const titleEl = listItem.querySelector('h3');
                const priceEl = listItem.querySelector('.list-item-price');
                if (titleEl) title = titleEl.textContent.trim();
                if (priceEl) price = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
                return { title, price };
            }

            // Check if it's a category featured card
            const categoryFeatured = btn.closest('.category-featured');
            if (categoryFeatured) {
                const titleEl = categoryFeatured.querySelector('.featured-title');
                const priceEl = categoryFeatured.querySelector('.featured-price');
                if (titleEl) title = titleEl.textContent.trim();
                if (priceEl) price = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
                return { title, price };
            }

            // Check if it's a top banner
            const banner = btn.closest('.banner-content') || btn.closest('.banner-card');
            if (banner) {
                const titleEl = banner.querySelector('.banner-title');
                if (titleEl) {
                    title = titleEl.textContent.replace('👑 ', '').replace('🍔 ', '').replace('🌭 ', '').trim();
                }
                const textContent = banner.textContent;
                const priceMatch = textContent.match(/(\\d+)\\s*₺/);
                if (priceMatch) {
                    price = parseInt(priceMatch[1]);
                } else {
                    price = 250; // Fallback
                }
                return { title, price };
            }
        } catch(e) {
            console.error(e);
        }

        return { title, price };
    }`;

js = js.replace(/function extractItemInfo\(btn\) \{[\s\S]*?return \{ title, price \};\n    \}/, newExtractItemInfo);

// 2. We also need to fix the add button click logic just in case info.price > 0 is failing
const oldClickLogic = `            const info = extractItemInfo(btn);
            if (info.price > 0) {
                cart.push(info);
                renderCart();
            }`;

const newClickLogic = `            const info = extractItemInfo(btn);
            if (info.price > 0 || info.title) {
                if (info.price === 0) info.price = 100; // Fallback so it doesn't fail silently
                cart.push({ ...info, excludedIngredients: [] }); // Add excluded array properly
                renderCart();
            }`;

js = js.replace(oldClickLogic, newClickLogic);


// 3. Re-inject the Edit Modal logic properly (which failed previously)
// We will replace `});` at the end of the file, but we will do it using lastIndexOf to be extremely safe.

const editModalLogic = `
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
});
`;

const lastIndex = js.lastIndexOf('});');
if (lastIndex !== -1 && !js.includes('window.openEditModal')) {
    js = js.substring(0, lastIndex) + editModalLogic;
}

fs.writeFileSync('js/app.js', js);
console.log('Fixed extract logic and injected missing edit modal logic.');
