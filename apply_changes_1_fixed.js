const fs = require('fs');

const srcPage = 'c:/Users/egem2/Desktop/cati-ocakbasi/app/page.js';
const destPage = 'c:/Users/egem2/Desktop/ortakoy-kumrucusu/app/page.js';

let code = fs.readFileSync(destPage, 'utf8');

// 1. Theme State
const themeStateBlock = `
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };
`;

if (!code.includes('const [theme, setTheme]')) {
  // Inject after isCartOpen
  code = code.replace(/const \[isCartOpen, setIsCartOpen\] = useState\(false\);/, 'const [isCartOpen, setIsCartOpen] = useState(false);' + themeStateBlock);
}

// 2. Toggle Theme Button
const toggleButtonCode = `
          <button onClick={toggleTheme} style={{ background: 'var(--theme-btn-bg)', border: '1px solid var(--glass-border)', color: 'var(--theme-btn-color)', padding: '8px', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
            <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
          </button>
`;

if (!code.includes('onClick={toggleTheme}')) {
  code = code.replace(/<LanguageSelector \/>/, toggleButtonCode + '          <LanguageSelector />');
}

// 3. Background Block
const bgBlock = `
      {(() => {
        // Renk parlaklık hesaplaması
        let textColor = '#ffffff';
        if (settings?.themeColor) {
          const hex = settings.themeColor.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) || 0;
          const g = parseInt(hex.substr(2, 2), 16) || 0;
          const b = parseInt(hex.substr(4, 2), 16) || 0;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          textColor = brightness > 128 ? '#000000' : '#ffffff';
        }

        // Arka plan teması hesaplaması
        const getSvgBg = (svgStr) => \`url("data:image/svg+xml,\${encodeURIComponent(svgStr)}")\`;
        
        const backgrounds = {
          'dots': getSvgBg(\`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='2.5' fill='#9ca3af' fill-opacity='0.4'/></svg>\`),
          'diagonal': getSvgBg(\`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M0 40L40 0M-10 10L10 -10M30 50L50 30' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.2'/></svg>\`),
          'waves': getSvgBg(\`<svg width='40' height='20' xmlns='http://www.w3.org/2000/svg'><path d='M0 10 Q 10 0, 20 10 T 40 10' fill='none' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.25'/></svg>\`),
          'checkers': getSvgBg(\`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><rect width='20' height='20' fill='#9ca3af' fill-opacity='0.15'/><rect x='20' y='20' width='20' height='20' fill='#9ca3af' fill-opacity='0.15'/></svg>\`),
          'grid': getSvgBg(\`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M20 0v40M0 20h40' fill='none' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.2'/></svg>\`),
          'rings': getSvgBg(\`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='14' fill='none' stroke='#9ca3af' stroke-width='2' stroke-opacity='0.25'/></svg>\`),
          'zigzag': getSvgBg(\`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M0 40 L40 0 Z' fill='none' stroke='#9ca3af' stroke-opacity='0.2' stroke-width='3'/></svg>\`),
          'diamonds': getSvgBg(\`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M20 0 L40 20 L20 40 L0 20 Z' fill='none' stroke='#9ca3af' stroke-opacity='0.2' stroke-width='2'/></svg>\`)
        };
        const bgPattern = settings?.bgThemeId && backgrounds[settings.bgThemeId] ? backgrounds[settings.bgThemeId] : 'none';

        if (!settings?.themeColor && bgPattern === 'none' && !settings?.customBgImage) return null;

        return (
          <>
            <style dangerouslySetInnerHTML={{__html: \`
              :root, body, body.light-mode {
                \${settings?.themeColor ? \`--accent-color: \${settings.themeColor} !important; --accent-text: \${textColor} !important;\` : ''}
                \${bgPattern !== 'none' && !settings?.customBgImage ? \`--theme-bg-pattern: \${bgPattern} !important;\` : ''}
              }
            \`}} />
            {settings?.customBgImage && (
              <>
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2, backgroundImage: \`url(\${settings.customBgImage})\`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}></div>
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, backdropFilter: 'blur(24px) saturate(150%)', backgroundColor: 'var(--bg-alpha-50)', WebkitBackdropFilter: 'blur(24px) saturate(150%)' }}></div>
              </>
            )}
          </>
        );
      })()}
`;

if (!code.includes('// Arka plan teması hesaplaması')) {
  // Find "return (\n    <>"
  code = code.replace(/return \(\s*<>/, 'return (\n    <>' + bgBlock);
}


// 4. Premium Toast Replacement
const catiCode = fs.readFileSync(srcPage, 'utf8');
const toastStartPattern = '{/* PREMIUM TOAST */}';
const toastEndPattern = '</div>\n    </>\n  );\n}';

const tStart = catiCode.indexOf(toastStartPattern);
const tEnd = catiCode.lastIndexOf(toastEndPattern);
const premiumToast = catiCode.substring(tStart, tEnd);

const destToastStart = code.indexOf('{/* Toast */}');
const destToastEnd = code.lastIndexOf(toastEndPattern);

if (destToastStart !== -1 && destToastEnd !== -1) {
  code = code.substring(0, destToastStart) + premiumToast + code.substring(destToastEnd);
}

fs.writeFileSync(destPage, code);
console.log('page.js updated.');
