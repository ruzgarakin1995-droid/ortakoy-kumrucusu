const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const items = [];
const regex = /<h3[^>]*>(.*?)<\/h3>[\s\S]*?(?:<span class="price">|<div class="list-item-price">)(.*?)(?:<\/span>|<\/div>)/g;

let match;
while ((match = regex.exec(html)) !== null) {
    items.push(match[1].replace(/<[^>]+>/g, '').trim() + ' - ' + match[2].replace(/<[^>]+>/g, '').trim());
}

console.log(items.join('\n'));
