const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

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

    // Find the broken card-highlight
    const chStart = sectionHtml.indexOf('<div class="card-highlight" style="margin-bottom: 16px;">');
    if (chStart !== -1) {
        // Because of the missing </div>, card-highlight "swallows" the rest of the list items.
        // We will extract just the content meant for card-highlight, and then rebuild the section properly.
        
        let titleMatch = sectionHtml.substring(chStart).match(/<h3 class="card-title">([\s\S]*?)<\/h3>/);
        let title = titleMatch ? titleMatch[1] : '';

        let imgMatch = sectionHtml.substring(chStart).match(/<img src="([^"]+)" alt="([^"]+)" class="card-img">/);
        let imgSrc = imgMatch ? imgMatch[1] : '';
        let imgAlt = imgMatch ? imgMatch[2] : '';

        let descMatch = sectionHtml.substring(chStart).match(/<p class="item-ingredients">([\s\S]*?)<\/p>/);
        let desc = descMatch ? descMatch[1] : '';

        let badgeMatch = sectionHtml.substring(chStart).match(/<div class="item-badges">([\s\S]*?)<\/div>/);
        let badges = badgeMatch ? badgeMatch[0] : '';

        let priceMatch = sectionHtml.substring(chStart).match(/<span class="price">([\s\S]*?)<\/span>/);
        let price = priceMatch ? priceMatch[1] : '';

        // For icons, we know it starts with <div class="ingredient-icons"> and ends with the last ing-icon before card-footer.
        let iconsHtml = '';
        let iconsStart = sectionHtml.indexOf('<div class="ingredient-icons">', chStart);
        let footerStart = sectionHtml.indexOf('<div class="card-footer" style="margin-top: 12px;">', chStart);
        
        if (iconsStart !== -1 && iconsStart < footerStart) {
            iconsHtml = sectionHtml.substring(iconsStart, footerStart).trim();
            if (!iconsHtml.endsWith('</div>')) {
                iconsHtml += '\n                    </div>'; // close it
            }
        }

        // We replace the entire broken opening chunk. 
        // The broken chunk starts at chStart and ends at the end of the button: <button class="btn-add"><i class="fa-solid fa-plus"></i></button>\n                    </div>\n                </div>\n            </div>
        // Wait, because of the missing div, the HTML generated had exactly:
        // <div class="card-footer" ...>...</div></div></div>
        
        const generatedSnippetEnd = sectionHtml.indexOf('</button>\n                    </div>\n                </div>\n            </div>', chStart) + '</button>\n                    </div>\n                </div>\n            </div>'.length;
        
        const brokenHtml = sectionHtml.substring(chStart, generatedSnippetEnd);

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
            </div>`;

        sectionHtml = sectionHtml.replace(brokenHtml, categoryFeatured);
        html = html.substring(0, sectionStart) + sectionHtml + html.substring(sectionEnd);
    }
});

fs.writeFileSync('index.html', html);

// CSS Update
let css = fs.readFileSync('css/style.css', 'utf8');
if (!css.includes('.category-featured {')) {
    css += `
/* CATEGORY FEATURED (Smaller than Slider Banner) */
.category-featured {
    background: var(--surface-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    margin-bottom: 24px;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.category-img-wrapper {
    position: relative;
    height: 140px;
    width: 100%;
}

.category-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.category-content {
    padding: 16px;
}

.category-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 6px;
    color: var(--text-light);
}

.category-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
}
`;
    fs.writeFileSync('css/style.css', css);
}

console.log('Fixed broken HTML and styled category-featured');
