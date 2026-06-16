import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEO_DIR = path.join(__dirname, 'demo-video');
const BASE = 'http://localhost:5173';
const PAUSE = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();

  // ── 1. Home page ─────────────────────────────────────────────────────────
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await PAUSE(2500);

  // ── 2. Login ──────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await PAUSE(1000);
  await page.locator('[name="email"]').fill('bob@example.com');
  await PAUSE(400);
  await page.locator('[name="password"]').fill('pass123');
  await PAUSE(400);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/`, { timeout: 8000 }).catch(() => {});
  await PAUSE(2500);

  // ── 3. Browse questions on Home ───────────────────────────────────────────
  await PAUSE(1500);

  // ── 4. Open a question with many answers ──────────────────────────────────
  const cards = page.locator('a[href^="/question/"]');
  const firstHref = await cards.first().getAttribute('href');
  await page.goto(`${BASE}${firstHref}`, { waitUntil: 'networkidle' });
  await PAUSE(2000);

  // ── 5. Scroll through answers ─────────────────────────────────────────────
  await page.evaluate(() => window.scrollBy(0, 400));
  await PAUSE(1500);

  // ── 6. Summarize Answers ──────────────────────────────────────────────────
  const summarizeBtn = page.getByRole('button', { name: /summarize answers/i });
  if (await summarizeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await summarizeBtn.scrollIntoViewIfNeeded();
    await PAUSE(600);
    await summarizeBtn.click();
    await page.waitForSelector('.alert-info', { timeout: 25000 }).catch(() => {});
    await PAUSE(3000);
    // Scroll to show the summary
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await PAUSE(2000);
    // Dismiss banner
    const closeBtn = page.locator('.btn-close').first();
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click();
      await PAUSE(1200);
    }
  }

  // ── 7. Tags page ──────────────────────────────────────────────────────────
  await page.goto(`${BASE}/tags`, { waitUntil: 'networkidle' });
  await PAUSE(2000);

  // ── 8. Ask a Question page ────────────────────────────────────────────────
  await page.goto(`${BASE}/ask`, { waitUntil: 'networkidle' });
  await PAUSE(1000);

  await page.locator('[name="title"]').fill('How do I handle async errors in Express middleware?');
  await PAUSE(500);
  await page.locator('[name="description"]').fill(
    'I have an express app with async middleware. When an error is thrown inside an async function, it crashes the server. How do I fix this properly without using try/catch everywhere?'
  );
  await PAUSE(500);
  await page.locator('[name="tags"]').fill('nodejs, express, async');
  await PAUSE(800);

  // ── 9. Click Improve with AI ──────────────────────────────────────────────
  const aiBtn = page.getByRole('button', { name: /improve with ai/i });
  if (await aiBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await aiBtn.click();
    await page.waitForSelector('.pq-suggestion-box', { timeout: 25000 }).catch(() => {});
    await PAUSE(2500);

    // Accept the title suggestion
    const acceptBtns = page.getByRole('button', { name: /accept/i });
    if (await acceptBtns.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await acceptBtns.first().click();
      await PAUSE(800);
    }
    // Reject the description suggestion
    const rejectBtns = page.getByRole('button', { name: /reject/i });
    if (await rejectBtns.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await rejectBtns.first().click();
      await PAUSE(800);
    }
    await PAUSE(1500);
  }

  // ── 10. Profile page ──────────────────────────────────────────────────────
  await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle' });
  await PAUSE(2000);

  // ── Done ──────────────────────────────────────────────────────────────────
  await PAUSE(1000);
  await context.close();
  await browser.close();

  console.log(`\nVideo saved to: ${VIDEO_DIR}`);
})();
