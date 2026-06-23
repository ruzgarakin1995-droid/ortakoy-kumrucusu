const fs = require('fs');

// 1. Fix CSS
let css = fs.readFileSync('css/style.css', 'utf8');

const additionalCSS = `
.compact-header h3 {
    color: #fff !important;
}
.compact-header .close-sheet {
    color: #fff !important;
}
.compact-btn {
    margin-top: 20px !important;
}
`;
fs.writeFileSync('css/style.css', css + additionalCSS);

// 2. Fix JS
let js = fs.readFileSync('js/app.js', 'utf8');

const badRenderHTML = `            cartItemEl.innerHTML = \`
                <div class="cart-item-info">\${item.title}</div>
                <div class="cart-item-price">\${item.price} ₺ <i class="fa-solid fa-xmark remove-item" data-index="\${index}" style="cursor:pointer; margin-left: 10px; color: rgba(255,255,255,0.5);"></i></div>
            \`;`;

const goodRenderHTML = `            let notesHtml = '';
            if (item.excludedIngredients && item.excludedIngredients.length > 0) {
                notesHtml = \`<div class="cart-item-notes" style="width: 100%; font-size: 11px; color: rgba(255,255,255,0.4); font-style: italic; margin-top: 4px;">İstemiyor: \${item.excludedIngredients.join(', ')}</div>\`;
            }

            cartItemEl.style.flexDirection = 'column';
            cartItemEl.style.alignItems = 'flex-start';

            cartItemEl.innerHTML = \`
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <div class="cart-item-info">\${item.title}</div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button class="btn-edit-item" onclick="openEditModal(\${index})"><i class="fa-solid fa-pen"></i> Düzenle</button>
                        <div class="cart-item-price">\${item.price} ₺ <i class="fa-solid fa-xmark remove-item" data-index="\${index}" style="cursor:pointer; margin-left: 10px; color: rgba(255,255,255,0.5);"></i></div>
                    </div>
                </div>
                \${notesHtml}
            \`;`;

js = js.replace(badRenderHTML, goodRenderHTML);

fs.writeFileSync('js/app.js', js);
console.log('Fixed visibility issues and restored edit button.');
