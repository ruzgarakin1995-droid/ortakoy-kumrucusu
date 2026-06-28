const fs = require('fs');

const srcAdmin = 'c:/Users/egem2/Desktop/cati-ocakbasi/app/admin/page.js';
const destAdmin = 'c:/Users/egem2/Desktop/ortakoy-kumrucusu/app/admin/page.js';

let catiCode = fs.readFileSync(srcAdmin, 'utf8');
let ortakoyCode = fs.readFileSync(destAdmin, 'utf8');

// 1. Extract DesignTab component
const startStr = '// ============================================================\n// DESIGN TAB';
const designTabStart = catiCode.indexOf(startStr);
const endStr = '\n}';
const designTabEnd = catiCode.indexOf(endStr, catiCode.indexOf('function DesignTab(')) + endStr.length;
const designTabCode = catiCode.substring(designTabStart, designTabEnd);

// Inject DesignTab to the end
if (!ortakoyCode.includes('function DesignTab(')) {
  ortakoyCode += '\n\n' + designTabCode;
}

// 2. Inject tab definition
const tabInject = "{ id: 'design', icon: 'fa-solid fa-palette', label: '🎨 Tasarım Yönetimi' },";
if (!ortakoyCode.includes(tabInject)) {
  const tabsIndex = ortakoyCode.indexOf('const tabs = [');
  if (tabsIndex !== -1) {
    const afterBracket = ortakoyCode.indexOf('[', tabsIndex) + 1;
    ortakoyCode = ortakoyCode.substring(0, afterBracket) + '\n    ' + tabInject + ortakoyCode.substring(afterBracket);
  }
}

// 3. Inject tab render
const renderInject = "{activeTab === 'design' && <DesignTab settings={settings} reload={loadSettings} />}";
if (!ortakoyCode.includes(renderInject)) {
  const renderAnchor = "{activeTab === 'settings' && <SettingsTab settings={settings} reload={loadSettings} />}";
  const renderAnchorIndex = ortakoyCode.indexOf(renderAnchor);
  if (renderAnchorIndex !== -1) {
    ortakoyCode = ortakoyCode.substring(0, renderAnchorIndex) + renderInject + '\n            ' + ortakoyCode.substring(renderAnchorIndex);
  } else {
    // If SettingsTab is not found, let's just search for activeTab
    const backupAnchor = "{activeTab === 'kurye' && <CouriersTab />}";
    const backupIndex = ortakoyCode.indexOf(backupAnchor);
    if(backupIndex !== -1){
        ortakoyCode = ortakoyCode.substring(0, backupIndex) + renderInject + '\n            ' + ortakoyCode.substring(backupIndex);
    }
  }
}

fs.writeFileSync(destAdmin, ortakoyCode);
console.log('admin page.js updated.');
