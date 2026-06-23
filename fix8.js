const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let css = fs.readFileSync('css/style.css', 'utf8');

// 1. Move filter-chips
const filterRegex = /(<div class="filter-chips">.*?<\/div>)/s;
const match = html.match(filterRegex);

if (match) {
    const chipsHtml = match[1];
    // Remove from original place
    html = html.replace(chipsHtml, '');
    
    // Add after </nav>
    html = html.replace('</nav>', '</nav>\n    ' + chipsHtml);
}

// 2. Add emoji and animation class to Kampanyalar button
html = html.replace('<a href="#kampanyali" class="nav-item active">Kampanyalar</a>', '<a href="#kampanyali" class="nav-item active nav-pulse">🔥 Kampanyalar</a>');

// 3. Add CSS for animation
const pulseCss = `
@keyframes navPulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
    70% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(212, 175, 55, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
}
.nav-pulse {
    animation: navPulse 2s infinite;
    display: inline-block;
}
`;

if (!css.includes('navPulse')) {
    css += '\n' + pulseCss;
}

fs.writeFileSync('index.html', html);
fs.writeFileSync('css/style.css', css);

console.log('Moved filter chips and added animation to Kampanyalar');
