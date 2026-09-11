// Automated End-to-End Verification Script (webapp-testing skill)
// Validates page rendering, HTTP status, SEO endpoints, and Contact API honeypot

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTests() {
  console.log(`\n🧪 Running Web Application E2E Test Suite against ${BASE_URL}...\n`);
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Homepage status & critical landmarks
  await test('Homepage responds with HTTP 200 and semantic landmarks', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    if (!html.includes('id="main-content"')) throw new Error('Missing #main-content skip link anchor');
    if (!html.includes('id="services"')) throw new Error('Missing #services landmark');
    if (!html.includes('id="pricing"')) throw new Error('Missing #pricing landmark');
    if (!html.includes('id="why-us"')) throw new Error('Missing #why-us landmark');
    if (!html.includes('id="faq"')) throw new Error('Missing #faq landmark');
    if (!html.includes('id="contact"')) throw new Error('Missing #contact landmark');
    if (!html.includes('ดีถาวรการบัญชี')) throw new Error('Missing company branding title');
  });

  // 2. Knowledge Hub page
  await test('Knowledge Hub page responds with HTTP 200 and articles', async () => {
    const res = await fetch(`${BASE_URL}/knowledge`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    if (!html.includes('คลังความรู้')) throw new Error('Missing Knowledge Hub header');
    if (!html.includes('5 ข้อควรรู้ก่อนจดทะเบียนบริษัทจำกัด')) throw new Error('Missing sample article');
  });

  // 3. Sitemap & Robots
  await test('SEO sitemap.xml and robots.txt are generated', async () => {
    const resSitemap = await fetch(`${BASE_URL}/sitemap.xml`);
    if (!resSitemap.ok) throw new Error(`Sitemap status ${resSitemap.status}`);
    const xml = await resSitemap.text();
    if (!xml.includes('<urlset') && !xml.includes('url')) throw new Error('Invalid sitemap XML');

    const resRobots = await fetch(`${BASE_URL}/robots.txt`);
    if (!resRobots.ok) throw new Error(`Robots status ${resRobots.status}`);
    const robotsText = await resRobots.text();
    if (!robotsText.includes('User-Agent') && !robotsText.includes('user-agent')) {
      throw new Error('Invalid robots.txt format');
    }
  });

  // 4. Contact API validation
  await test('Contact API validates missing fields with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'Test' })
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 5. Contact API Honeypot bot trap
  await test('Contact API traps spam bot honeypot silently with HTTP 200', async () => {
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Bot',
        lastName: 'Spam',
        email: 'spam@bot.com',
        message: 'Buy cheap viagra',
        website: 'http://spam-link.com' // Honeypot trigger
      })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Honeypot did not return success dummy');
  });

  console.log(`\n🏁 Test Results: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
