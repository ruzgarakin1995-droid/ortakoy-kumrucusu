const fs = require('fs');
const filePath = 'c:/Users/egem2/Desktop/ortakoy-kumrucusu/app/globals.css';

let css = fs.readFileSync(filePath, 'utf8');

const additionalStyles = `
/* LIGHT MODE CART & CHECKOUT REFINEMENTS */
body.light-mode .checkout-sheet {
  background: var(--surface-color);
}

body.light-mode .sheet-header h3,
body.light-mode .compact-header h3 {
  color: var(--text-main);
}

body.light-mode .close-sheet,
body.light-mode .sheet-header button {
  color: var(--text-main) !important;
}

body.light-mode .form-group input, 
body.light-mode .form-group textarea {
  background: rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  color: var(--text-main) !important;
}

body.light-mode .form-group label {
  color: var(--text-muted);
}

body.light-mode .payment-section h4 {
  color: var(--text-main);
}

body.light-mode .payment-method {
  background: rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  color: var(--text-muted) !important;
}

body.light-mode .payment-method:hover {
  background: rgba(0, 0, 0, 0.08) !important;
}

body.light-mode .coupon-input {
  background: var(--surface-color) !important;
  color: var(--text-main) !important;
  border: 1px solid var(--glass-border) !important;
}

body.light-mode .btn-apply-coupon {
  background: rgba(0, 0, 0, 0.03);
}

body.light-mode .cart-overlay {
  background: rgba(255, 255, 255, 0.8) !important;
}
`;

if (!css.includes('LIGHT MODE CART & CHECKOUT REFINEMENTS')) {
  fs.appendFileSync(filePath, '\n' + additionalStyles);
  console.log('Appended light mode checkout refinements');
} else {
  console.log('Already appended');
}
