const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3000/analiticas', { waitUntil: 'networkidle' });
  const result = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/clientes');
      const text = await res.text();
      return { ok: res.ok, status: res.status, body: text.slice(0, 500) };
    } catch (error) {
      return { error: error.message };
    }
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
