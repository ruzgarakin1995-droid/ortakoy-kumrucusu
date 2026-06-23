const fs = require('fs');

// 1. Update HTML
let html = fs.readFileSync('index.html', 'utf8');

// Replace "Popüler" with "En Popüler" only in the hero-slider section
const sliderStart = html.indexOf('<div class="hero-slider">');
const sliderEnd = html.indexOf('</section>', sliderStart);
let sliderHtml = html.substring(sliderStart, sliderEnd);

sliderHtml = sliderHtml.replace(/<span class="tag-badge tag-pop"([^>]*)><i class="fa-solid fa-star"><\/i>\s*Popüler<\/span>/g, '<span class="tag-badge tag-pop"$1><i class="fa-solid fa-star"></i> En Popüler</span>');

html = html.substring(0, sliderStart) + sliderHtml + html.substring(sliderEnd);

// Add a special class "shimmer-heading" to banner titles so they animate
html = html.replace(/<h2 class="banner-title">/g, '<h2 class="banner-title shimmer-heading">');

fs.writeFileSync('index.html', html);

// 2. Update CSS
let css = fs.readFileSync('css/style.css', 'utf8');

const shimmerCss = `
/* SHIMMER HEADING ANIMATION */
.shimmer-heading {
    background: linear-gradient(
        90deg,
        #fff 0%,
        #ffe680 40%,
        #fff 50%,
        #ffe680 60%,
        #fff 100%
    );
    background-size: 200% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    animation: textShimmer 3s linear infinite;
    display: inline-block;
}

@keyframes textShimmer {
    to {
        background-position: 200% center;
    }
}
`;

if (!css.includes('textShimmer')) {
    css += '\n' + shimmerCss;
    fs.writeFileSync('css/style.css', css);
}

console.log('Added En Popüler and shimmer animation!');
