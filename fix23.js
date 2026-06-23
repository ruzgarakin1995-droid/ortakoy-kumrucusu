const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The block structure is:
// <div class="list-item">
//     <div class="list-item-thumb"><img src="..." alt="İzmir Kumru Menü (Kola)"></div>
//     ...
//     </div>
// </div>
// Since it's exactly one top-level <div class="list-item"> for each, we can remove them using a regex that captures from <div class="list-item"> to the corresponding </div></div>\s*</div> if we uniquely identify them.
// Alternatively, since we know their titles, we can remove `<div class="list-item">[\s\S]*?<h3>TITLE<\/h3>[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>`

const itemsToRemove = [
    'İzmir Kumru Menü (Kola)',
    'Ayvalık Tostu Menü (Kola)',
    'Hamburger Menü (Kola)',
    'Ekmek Arası İncik Menü (Kola)',
    'Dürüm İncik Menü (Kola)'
];

itemsToRemove.forEach(title => {
    // Escape parenthesis for regex
    const safeTitle = title.replace(/[()]/g, '\\$&');
    const regex = new RegExp(`<div class="list-item">\\s*<div class="list-item-thumb"><img src="images/[^"]+" alt="${safeTitle}"></div>[\\s\\S]*?<h3>${safeTitle}<\\/h3>[\\s\\S]*?<button class="btn-add-small"><i class="fa-solid fa-plus"><\\/i><\\/button>\\s*<\\/div>\\s*<\\/div>\\s*<\\/div>`, 'g');
    
    html = html.replace(regex, '');
});

fs.writeFileSync('index.html', html);
console.log('Removed Kola menus!');
