const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('Page loaded');
    
    // Type in search bar to see if it crashes
    await page.type('input[placeholder="Ürün ara..."]', 'a');
    await page.waitForTimeout(1000);
    console.log('Typed in search bar');
  } catch (err) {
    console.log('GOTO ERROR:', err.message);
  }

  await browser.close();
})();
