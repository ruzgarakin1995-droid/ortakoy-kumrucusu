const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const targetSections = [
    'ekmek-arasi'
];

targetSections.forEach(sectionId => {
    const sectionStart = html.indexOf(`<section id="${sectionId}"`);
    if (sectionStart === -1) {
        console.log(`Section ${sectionId} not found.`);
        return;
    }
    const sectionEnd = html.indexOf('</section>', sectionStart);
    let sectionHtml = html.substring(sectionStart, sectionEnd);

    // Find the first list-item
    const firstItemRegex = /<div class="list-item">([\s\S]*?)<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/;
    const match = sectionHtml.match(firstItemRegex);
    if (match) {
        const itemHtml = match[0];
        
        let badges = '';
        const badgeMatch = itemHtml.match(/<div class="item-badges">[\s\S]*?<\/div>/);
        if (badgeMatch) badges = badgeMatch[0];

        let imgSrc = '';
        let imgAlt = '';
        const imgMatch = itemHtml.match(/<img src="([^"]+)" alt="([^"]+)">/);
        if (imgMatch) {
            imgSrc = imgMatch[1];
            imgAlt = imgMatch[2];
        }

        let title = '';
        const titleMatch = itemHtml.match(/<h3>([\s\S]*?)<\/h3>/);
        if (titleMatch) title = titleMatch[1];

        let ingredients = '';
        const ingMatch = itemHtml.match(/<p class="item-ingredients">([\s\S]*?)<\/p>/);
        if (ingMatch) ingredients = ingMatch[0];

        let icons = '';
        const iconContainerMatch = itemHtml.match(/<div class="ingredient-icons">[\s\S]*?<\/div>(?=\s*(?:<\/div>|<div class="list-item-bottom">))/);
        if (iconContainerMatch) icons = iconContainerMatch[0];

        let price = '';
        const priceMatch = itemHtml.match(/<div class="list-item-price">([\s\S]*?)<\/div>/);
        if (priceMatch) price = priceMatch[1];

        const cardHighlight = `
            <div class="card-highlight" style="margin-bottom: 16px;">
                ${badges}
                <div class="card-img-wrapper">
                    <img src="${imgSrc}" alt="${imgAlt}" class="card-img">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${title}</h3>
                    ${ingredients}
                    ${icons}
                    <div class="card-footer" style="margin-top: 12px;">
                        <span class="price">${price}</span>
                        <button class="btn-add"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>`;

        sectionHtml = sectionHtml.replace(firstItemRegex, cardHighlight);
        html = html.substring(0, sectionStart) + sectionHtml + html.substring(sectionEnd);
        console.log(`Transformed first item in ${sectionId}`);
    }
});

fs.writeFileSync('index.html', html);
console.log('Done.');
