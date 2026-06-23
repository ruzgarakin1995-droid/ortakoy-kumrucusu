const fs = require('fs');

let pageJs = fs.readFileSync('app/page.js', 'utf-8');

// 1. Add searchQuery state
if (!pageJs.includes('const [searchQuery, setSearchQuery] = useState')) {
  pageJs = pageJs.replace(
    '  // Checkout Multi-Step Logic',
    "  const [searchQuery, setSearchQuery] = useState('');\n  // Checkout Multi-Step Logic"
  );
}

// 2. Update search input
pageJs = pageJs.replace(
  /<input type="text" placeholder="Ürün ara\.\.\." onChange=\{\(e\) => \{[\s\S]*?\}\}\/>/,
  `<input type="text" placeholder="Ürün ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />`
);

// 3. Hide banners
pageJs = pageJs.replace(
  /\{data\.banners\.length > 0 && \(/g,
  '{!searchQuery && data.banners.length > 0 && ('
);

// 4. Hide featured
pageJs = pageJs.replace(
  /\{data\.featured\.length > 0 && \(/g,
  '{!searchQuery && data.featured.length > 0 && ('
);

// 5. Update categories mapping and filtering
const targetCategoriesOld = `{data.categories.map(cat => (
          <section key={cat.id} id={cat.id} className="menu-section">
            <h2 className="section-title">
              {cat.icon && <i className={cat.icon}></i>} {cat.emoji} {cat.title}
            </h2>
            
            {cat.items.map(item => (`;

const targetCategoriesNew = `{data.categories.map(cat => {
          const filteredItems = cat.items.filter(item => 
            !searchQuery || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          
          if (searchQuery && filteredItems.length === 0) return null;

          return (
          <section key={cat.id} id={cat.id} className="menu-section">
            <h2 className="section-title">
              {cat.icon && <i className={cat.icon}></i>} {cat.emoji} {cat.title}
            </h2>
            
            {filteredItems.map(item => (`;

pageJs = pageJs.replace(targetCategoriesOld, targetCategoriesNew);

// Since we replaced the `cat => (` with `cat => { ... return (`, we need to close the bracket for `data.categories.map`
// Currently it is: `          </section>\n        ))}`
// Let's replace `        ))}` with `        )})}` but wait, there could be other `))}` in the file.
// I'll be specific.

const closingOld = `          </section>
        ))}

        {/* CART BUTTON (MOBILE FAB) */}`;

const closingNew = `          </section>
        )})}

        {/* CART BUTTON (MOBILE FAB) */}`;

pageJs = pageJs.replace(closingOld, closingNew);

fs.writeFileSync('app/page.js', pageJs, 'utf-8');
console.log('Search logic updated');
