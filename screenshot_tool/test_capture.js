const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function test() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });

  await page.goto('http://localhost:4200/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(screenshotsDir, 'test_login.png') });
  console.log('Login screenshot taken successfully');

  await browser.close();
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
