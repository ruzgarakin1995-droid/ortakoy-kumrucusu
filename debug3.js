const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<button[^>]*class="([^"]*btn-add[^"]*)"[^>]*>.*?<\/button>/g;
let match;
while ((match = regex.exec(html)) !== null) {
    const btnIndex = match.index;
    
    // Look backwards to find the closest <div class="...">
    const beforeBtn = html.substring(Math.max(0, btnIndex - 1000), btnIndex);
    
    const listMatch = beforeBtn.lastIndexOf('class="list-item"');
    const catMatch = beforeBtn.lastIndexOf('class="category-featured"');
    const bannerMatch = beforeBtn.lastIndexOf('class="banner-content"');
    
    // Check if there are any closing tags that close the parent before the button
    // It's rough, but let's see what the parent is.
    const lastDiv = beforeBtn.lastIndexOf('<div');
    const parentClassMatch = beforeBtn.substring(lastDiv).match(/class="([^"]+)"/);
    const parentClass = parentClassMatch ? parentClassMatch[1] : 'unknown';
    
    if (listMatch === -1 && catMatch === -1 && bannerMatch === -1) {
        console.log(`Button at ${btnIndex} has no valid wrapper. Parent class: ${parentClass}`);
    } else {
        // Find the title and price of this item
        let titleMatch = beforeBtn.match(/<h3>([^<]+)<\/h3>/g);
        if (!titleMatch) titleMatch = beforeBtn.match(/class="[^"]*title[^"]*">([^<]+)<\//g);
        
        let priceMatch = beforeBtn.match(/class="[^"]*price[^"]*">([^<]+)<\//g);
        
        // console.log(`Button at ${btnIndex}. Parent: ${parentClass}. Title: ${titleMatch ? titleMatch.pop() : '?'}, Price: ${priceMatch ? priceMatch.pop() : '?'}`);
    }
}
