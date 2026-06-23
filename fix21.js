const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 5. NAVBAR UPDATES
const navBarAddition = `
            <a href="#durumler" class="nav-item">Dürümler</a>
            <a href="#tostlar" class="nav-item">Tostlar</a>
            <a href="#porsiyonlar" class="nav-item">Porsiyonlar</a>`;
// insert into the top navigation scroll container
html = html.replace(/(<a href="#kampanyali" class="nav-item active">.*?<\/a>)/, '$1' + navBarAddition);

fs.writeFileSync('index.html', html);
console.log('Added sections to navbar');
