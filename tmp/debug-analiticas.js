const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  await page.goto('http://127.0.0.1:3000/analiticas', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  const data = await page.evaluate(() => {
    const canvas = document.querySelector('.pbi-canvas');
    const hasSkeleton = document.querySelectorAll('.pbi-skeleton').length;
    const hasTable = document.querySelectorAll('.pbi-table').length;
    const tileCount = document.querySelectorAll('.pbi-tile').length;
    const childCount = canvas ? canvas.children.length : 0;
    const chartWrappers = Array.from(document.querySelectorAll('.recharts-wrapper, .recharts-surface, .recharts-cartesian-grid, .recharts-tooltip-wrapper'))
      .map(el => ({ tag: el.tagName, class: el.className, width: el.clientWidth, height: el.clientHeight, display: getComputedStyle(el).display, visibility: getComputedStyle(el).visibility, opacity: getComputedStyle(el).opacity, containsSVG: !!el.querySelector('svg') }));
    const divs = Array.from(document.querySelectorAll('.pbi-tile')).slice(0, 20).map(el => ({ class: el.className, width: el.clientWidth, height: el.clientHeight, display: getComputedStyle(el).display, innerText: el.innerText.slice(0, 120) }));
    const svgs = Array.from(document.querySelectorAll('svg')).map(el => ({ class: (el.className.baseVal || el.className).toString(), width: el.clientWidth, height: el.clientHeight, display: getComputedStyle(el).display, visibility: getComputedStyle(el).visibility }));
    return { canvas: canvas ? { width: canvas.clientWidth, height: canvas.clientHeight, childCount, html: canvas.innerHTML.slice(0, 1200) } : null, hasSkeleton, hasTable, tileCount, chartWrappers, svgsCount: svgs.length, svgs, divs };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
