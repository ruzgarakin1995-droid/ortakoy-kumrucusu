const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// I will look for `<div class="card-highlight" style="margin-bottom: 16px;">` blocks.
// Because of the missing </div>, they wrap everything below them until the end of the section!
// Let's replace the whole card-highlight block.

const targetSections = [
    'kumpirler',
    'durumler',
    'tostlar',
    'porsiyonlar',
    'kumrular',
    'burgerler',
    'ekmek-arasi',
    'tatlilar'
];

targetSections.forEach(sectionId => {
    const sectionStart = html.indexOf(`<section id="${sectionId}"`);
    if (sectionStart === -1) return;
    
    const sectionEnd = html.indexOf('</section>', sectionStart);
    let sectionHtml = html.substring(sectionStart, sectionEnd);

    // Find the first <div class="card-highlight" style="margin-bottom: 16px;">
    const chStart = sectionHtml.indexOf('<div class="card-highlight" style="margin-bottom: 16px;">');
    if (chStart !== -1) {
        // Since there is a missing </div>, we can find the start of the next list item.
        const nextListStart = sectionHtml.indexOf('<div class="list-item">', chStart);
        
        let targetHtml = '';
        if (nextListStart !== -1) {
            targetHtml = sectionHtml.substring(chStart, nextListStart);
        } else {
            targetHtml = sectionHtml.substring(chStart); // To the end
        }

        // Now extract details from targetHtml
        const titleMatch = targetHtml.match(/<h3 class="card-title">(.*?)<\/h3>/);
        const title = titleMatch ? titleMatch[1] : '';

        const imgMatch = targetHtml.match(/<img src="([^"]+)" alt="([^"]+)" class="card-img">/);
        const imgSrc = imgMatch ? imgMatch[1] : '';
        const imgAlt = imgMatch ? imgMatch[2] : '';

        const descMatch = targetHtml.match(/<p class="item-ingredients">([\s\S]*?)<\/p>/);
        const desc = descMatch ? descMatch[1] : '';

        const badgeMatch = targetHtml.match(/<div class="item-badges">[\s\S]*?<\/div>/);
        const badges = badgeMatch ? badgeMatch[0] : '';

        // Extracting icons correctly from the broken HTML
        let iconsHtml = '';
        if (targetHtml.includes('class="ingredient-icons"')) {
            const iconsStart = targetHtml.indexOf('<div class="ingredient-icons">');
            const footerStart = targetHtml.indexOf('<div class="card-footer"');
            if (iconsStart !== -1 && footerStart !== -1) {
                let inner = targetHtml.substring(iconsStart, footerStart);
                // Ensure it ends with </div>
                if (!inner.trim().endsWith('</div>')) {
                    inner = inner.trim() + '</div>'; // close the outer ingredient-icons
                }
                iconsHtml = inner;
            }
        }

        const priceMatch = targetHtml.match(/<span class="price">(.*?)<\/span>/);
        const price = priceMatch ? priceMatch[1] : '';

        const categoryFeatured = `
            <div class="category-featured">
                ${badges}
                <div class="category-img-wrapper">
                    <img src="${imgSrc}" alt="${imgAlt}" class="category-img">
                </div>
                <div class="category-content">
                    <h3 class="category-title">${title}</h3>
                    <p class="item-ingredients">${desc}</p>
                    ${iconsHtml}
                    <div class="category-footer">
                        <span class="price">${price}</span>
                        <button class="btn-add"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>\n            `;

        sectionHtml = sectionHtml.replace(targetHtml, categoryFeatured);
        
        // Also remove one extra </div> from the end of the section because we fixed the missing one?
        // Actually, the original HTML had N `</div>`s at the end of the section.
        // My previous script REPLACED the list-item with card-highlight.
        // list-item had </div></div></div> (3 closures).
        // card-highlight had </div></div></div> (3 closures).
        // BUT because iconsHtml was missing 1 closure, card-highlight ended up only closing 2.
        // This means there is 1 extra </div> floating at the end of the section!
        // We need to find and remove one </div> at the very end of sectionHtml.
        // Or wait, if we just replace it perfectly now, we don't have to worry about the end of the section?
        // Wait, if card-highlight had 3 closures in its TEMPLATE:
        //      </div> <!-- card-footer -->
        //    </div> <!-- card-content -->
        // </div> <!-- card-highlight -->
        // BUT the targetHtml variable we substringed only goes up to the next list item.
        // So `targetHtml` contains the broken opening part.
        // Wait, where are those 3 closing divs from my card-highlight template?
        // They are at the END of targetHtml? No, they might be pushed down!
        // Let's just recreate the entire section properly by extracting ALL list items.
    }
});

