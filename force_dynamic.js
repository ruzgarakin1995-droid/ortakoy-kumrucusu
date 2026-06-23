const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'app/api');
const dirs = fs.readdirSync(apiDir);

for (const dir of dirs) {
  const routePath = path.join(apiDir, dir, 'route.js');
  if (fs.existsSync(routePath)) {
    let content = fs.readFileSync(routePath, 'utf8');
    if (!content.includes("export const dynamic = 'force-dynamic';")) {
      content = "export const dynamic = 'force-dynamic';\n" + content;
      fs.writeFileSync(routePath, content);
      console.log(`Updated ${routePath}`);
    }
  }
}
