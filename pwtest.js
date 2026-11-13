const { chromium } = require('playwright');
const http = require('http');
function apiReq(path, method, body, cookie) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const opts = { hostname: 'localhost', port: 3000, path, method, headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } };
    if (cookie) opts.headers.Cookie = cookie;
    const req = http.request(opts, res => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => resolve({ status: res.statusCode, body: chunks, headers: res.headers }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}
(async () => {
  const email = 'testgap' + Date.now() + '@example.edu';
  const r1 = await apiReq('/api/auth/signup', 'POST', { fullName: 'Test User', email, password: 'Password1', confirmPassword: 'Password1', acceptedTerms: true });
  console.log('signup', r1.status);
  console.log('SET-COOKIE:', r1.headers['set-cookie']);
  const cookie = (r1.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
  // save a paper
  const search = await apiReq('/api/papers?q=machine+learning', 'GET', undefined, cookie);
  let paperId = null;
  try { paperId = JSON.parse(search.body).data[0].id; } catch {}
  if (paperId) {
    await apiReq('/api/library', 'POST', { paperId }, cookie);
    console.log('saved paper', paperId);
  }
  const browser = await chromium.launch();
  const context = await browser.newContext();
  if (cookie) {
    const cookies = cookie.split(';').map(c => {
      const [name, value] = c.trim().split('=');
      return { name, value, domain: 'localhost', path: '/' };
    });
    await context.addCookies(cookies);
  }
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => { console.log('CONSOLE', msg.type(), msg.text()); if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
  // check session
  const sess = await apiReq('/api/auth/session', 'GET', undefined, cookie);
  console.log('SESSION:', sess.status, sess.body);
  await page.goto('http://localhost:3000/research-gaps');
  await page.waitForTimeout(2000);
  const fetchResult = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/workspace', { credentials: 'include' });
      const text = await res.text();
      return { status: res.status, length: text.length, preview: text.slice(0, 200) };
    } catch (e) {
      return { error: String(e) };
    }
  });
  console.log('FETCH RESULT:', JSON.stringify(fetchResult));
  await page.waitForTimeout(15000);
  console.log('URL:', page.url());
  console.log('URL:', page.url());
  await page.screenshot({ path: 'rg.png' });
  console.log('HAS INPUT:', (await page.content()).includes('Enter a research topic'));
  const content = await page.content();
  console.log('HAS RESEARCH GAP:', content.includes('Research gap explorer'));
  console.log('HAS STOREGATE:', content.includes('STOREGATE MOUNTED'));
  console.log('BODY LENGTH:', content.length);
  console.log('HAS ERROR BOUNDARY:', (await page.content()).includes('The workspace hit an unexpected error'));
  // run analysis
  const input = page.locator('input[placeholder^="Enter a research topic"]');
  if (await input.count()) {
    await input.fill('machine learning');
    await page.click('button:has-text("Run analysis")');
    await page.waitForTimeout(5000);
  }
  console.log('CONSOLE ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
  process.exit(0);
})();
