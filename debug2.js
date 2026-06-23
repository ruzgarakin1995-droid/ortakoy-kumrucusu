const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = html.match(/<button[^>]*class="[^"]*btn-add[^"]*"[^>]*>.*?<\/button>/g);
if (matches) {
    console.log(`Found ${matches.length} buttons.`);
    // Now let's try to extract info for each match using our logic to see which one fails
}

// Check other items
const extraSection = html.indexOf('ekstra');
if (extraSection !== -1) {
    console.log("Found 'ekstra' text at index", extraSection);
    console.log(html.substring(Math.max(0, extraSection - 100), extraSection + 400));
}

// Check 'Yan Lezzetler' or 'Ekstralar' or something
const yanLezzetler = html.indexOf('Yan Lezzetler');
if (yanLezzetler !== -1) {
    console.log("Found Yan Lezzetler at index", yanLezzetler);
    console.log(html.substring(Math.max(0, yanLezzetler - 100), yanLezzetler + 400));
}
