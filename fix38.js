const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');

// Update .checkout-overlay to be premium
css = css.replace(
    /\.checkout-overlay \{[\s\S]*?\}/,
    `.checkout-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 2000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s ease, visibility 0.4s ease;
}`
);

// Update .checkout-sheet to slide up smoothly and have a dark gold theme
css = css.replace(
    /\.checkout-sheet \{[\s\S]*?\}/,
    `.checkout-sheet {
    width: 100%;
    max-width: 600px;
    background: var(--surface-color);
    border-radius: 24px 24px 0 0;
    padding: 24px;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(255, 193, 7, 0.2);
    display: flex;
    flex-direction: column;
    max-height: 85vh;
}`
);

// Add empty state styles
const emptyStateCss = `
.cart-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: rgba(255,255,255,0.5);
    text-align: center;
}
.cart-items-container {
    overflow-y: auto;
    max-height: 40vh;
    padding-right: 5px;
}
/* Scrollbar styling for cart */
.cart-items-container::-webkit-scrollbar {
    width: 6px;
}
.cart-items-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}
.cart-items-container::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 4px;
}
`;

css += '\n' + emptyStateCss;

// Fix cart-item border
css = css.replace(
    /\.cart-item \{[\s\S]*?\}/,
    `.cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}`
);

// Premium total row
css = css.replace(
    /\.cart-total-row \{[\s\S]*?\}/,
    `.cart-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2rem;
    margin: 20px 0;
    padding-top: 15px;
    border-top: 2px dashed rgba(255, 193, 7, 0.2);
    color: var(--primary-color);
}`
);

// Delivery notice
css = css.replace(
    /\.delivery-notice \{[\s\S]*?\}/,
    `.delivery-notice {
    background: rgba(255, 193, 7, 0.1);
    color: var(--primary-color);
    padding: 12px;
    border-radius: 12px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    border: 1px solid rgba(255, 193, 7, 0.2);
}`
);

fs.writeFileSync('css/style.css', css);
console.log('CSS updated for premium cart modal.');
