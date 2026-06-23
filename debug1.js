const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('js/app.js', 'utf8');
console.log('Edit Modal in HTML:', html.includes('id="editItemModal"'));
console.log('Plus button class matches:', html.match(/<button[^>]*><i class="fa-solid fa-plus"><\/i><\/button>/g));
console.log('Add Buttons Query:', js.match(/querySelectorAll\('.btn-add, \.btn-add-small, \.btn-large, \.btn-add-large'\)/g));
console.log('Extract item logic:', js.match(/extractItemInfo/g));
console.log('openEditModal in JS:', js.includes('window.openEditModal = function'));
