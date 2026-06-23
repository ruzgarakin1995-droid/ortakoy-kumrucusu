const fs = require('fs');
let pageJs = fs.readFileSync('app/page.js', 'utf-8');

const target1 = `{/* MENU CATEGORIES */}
        {data.categories.map(cat => (
          <section key={cat.id} id={cat.id} className="menu-section">
            <h2 className="section-title">
              {cat.icon && <i className={cat.icon}></i>} {cat.emoji} {cat.title}
            </h2>
            
            {cat.items.map(item => (`;

const replace1 = `{/* MENU CATEGORIES */}
        {data.categories.map(cat => {
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

pageJs = pageJs.replace(target1, replace1);

const target2 = `              )
            ))}
          </section>
        ))}`;

const replace2 = `              )
            ))}
          </section>
        )})}`;

pageJs = pageJs.replace(target2, replace2);

fs.writeFileSync('app/page.js', pageJs, 'utf-8');
console.log('Fixed Categories Map');
