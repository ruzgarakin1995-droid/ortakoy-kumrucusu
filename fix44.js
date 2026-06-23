const fs = require('fs');

let css = fs.readFileSync('css/style.css', 'utf8');

// I will append the required CSS for the two-step checkout slider, the edit modal, and ingredients toggle switches.
const additionalCSS = `
/* --- Slider Checkout CSS --- */
.checkout-slider {
    display: flex;
    width: 200%;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    height: 60vh; /* Fixed max height for slider area */
}
.checkout-slider.step-2-active {
    transform: translateX(-50%);
}
.checkout-step {
    width: 50%;
    display: flex;
    flex-direction: column;
    height: 100%;
}
.step-body {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20px;
}
/* Hide scrollbar completely as requested, but keep functionality */
.step-body::-webkit-scrollbar {
    display: none;
}
.step-body {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

.step-footer {
    display: flex;
    gap: 12px;
    padding: 15px 0;
    background: var(--surface-color);
    border-top: 1px solid rgba(255,255,255,0.05);
}
.btn-back {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 1;
}
.btn-back:hover {
    background: rgba(255, 255, 255, 0.1);
}

.cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
}
.cart-item-top {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
}
.cart-item-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}
.btn-edit-item {
    background: rgba(255, 193, 7, 0.1);
    color: var(--primary-color);
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
}
.cart-item-notes {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    font-style: italic;
    width: 100%;
}

/* --- Edit Item Modal --- */
.edit-item-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2500;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}
.edit-item-overlay.active {
    opacity: 1;
    visibility: visible;
}
.edit-item-sheet {
    background: var(--surface-color);
    width: 90%;
    max-width: 400px;
    border-radius: 20px;
    padding: 24px;
    transform: scale(0.9);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    border: 1px solid rgba(255, 193, 7, 0.2);
    display: flex;
    flex-direction: column;
    max-height: 80vh;
}
.edit-item-overlay.active .edit-item-sheet {
    transform: scale(1);
}
.edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 16px;
    margin-bottom: 16px;
}
.edit-header h4 {
    margin: 0;
    color: #fff;
    font-size: 16px;
}
.close-edit {
    font-size: 20px;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
}
.edit-body {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.edit-body::-webkit-scrollbar { display: none; }
.edit-body { -ms-overflow-style: none; scrollbar-width: none; }

.ingredient-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255,255,255,0.03);
    border-radius: 12px;
}
.ingredient-name {
    color: #fff;
    font-size: 14px;
}
/* Toggle Switch */
.switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
}
.switch input { 
    opacity: 0;
    width: 0;
    height: 0;
}
.slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(255,255,255,0.1);
    transition: .4s;
    border-radius: 24px;
}
.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: #fff;
    transition: .4s;
    border-radius: 50%;
}
input:checked + .slider {
    background-color: #4caf50;
}
input:focus + .slider {
    box-shadow: 0 0 1px #4caf50;
}
input:checked + .slider:before {
    transform: translateX(20px);
}
.edit-footer {
    padding-top: 16px;
    margin-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
}
`;

fs.writeFileSync('css/style.css', css + additionalCSS);
console.log('CSS updated for slider and edit modal.');
