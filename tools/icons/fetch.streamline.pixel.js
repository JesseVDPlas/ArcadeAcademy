const fs = require('fs/promises');
const path = require('path');
const readline = require('readline');
const { chromium } = require('playwright');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'icons', 'config.json');
const WISHLIST_PATH = path.join(ROOT, 'icons', 'wishlist.json');
const DOWNLOADED_PATH = path.join(ROOT, 'icons', 'downloaded.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

const prompt = (message) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(message, () => {
      rl.close();
      resolve();
    });
  });

const loadJson = async (filePath, fallback) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const chooseSourceUrl = (urls) => {
  const svg = urls.find((url) => url.toLowerCase().includes('.svg'));
  if (svg) return { url: svg, format: 'svg' };
  const png = urls.find((url) => url.toLowerCase().includes('.png'));
  if (png) return { url: png, format: 'png' };
  return null;
};

const findSearchBox = async (page) => {
  const candidates = [
    'input[type="search"]',
    'input[placeholder*="Search" i]',
    'input[aria-label*="Search" i]',
  ];

  for (const selector of candidates) {
    const locator = page.locator(selector).first();
    if (await locator.count()) {
      return locator;
    }
  }
  return null;
};

const findResultLink = async (page) => {
  const locator = page.locator('a[href*="/icons/"][href*="pixel"]').first();
  if (await locator.count()) return locator;
  return null;
};

const fetchWithContext = async (page, url) => {
  const response = await page.context().request.get(url);
  if (!response.ok()) {
    throw new Error(`Download failed: ${response.status()} ${response.statusText()}`);
  }
  const body = await response.body();
  return body;
};

const downloadFromPage = async (page, destDir) => {
  const urls = await page.$$eval('a', (links) => links.map((link) => link.href).filter(Boolean));
  const chosen = chooseSourceUrl(urls);
  if (chosen) {
    const buffer = await fetchWithContext(page, chosen.url);
    const destPath = path.join(destDir, `source.${chosen.format}`);
    await fs.writeFile(destPath, buffer);
    return { sourceUrl: chosen.url, format: chosen.format, destPath };
  }

  const downloadButton = page.getByRole('button', { name: /download/i }).first();
  if (await downloadButton.count()) {
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await downloadButton.click();

    const svgOption = page.getByRole('menuitem', { name: /svg/i }).first();
    if (await svgOption.count()) {
      await svgOption.click();
    } else {
      const pngOption = page.getByRole('menuitem', { name: /png/i }).first();
      if (await pngOption.count()) await pngOption.click();
    }

    const download = await downloadPromise;
    const suggested = download.suggestedFilename();
    const ext = suggested.includes('.') ? suggested.split('.').pop() : 'png';
    const destPath = path.join(destDir, `source.${ext}`);
    await download.saveAs(destPath);
    return { sourceUrl: download.url(), format: ext, destPath };
  }

  return null;
};

const run = async () => {
  const config = await loadJson(CONFIG_PATH, {});
  const wishlist = await loadJson(WISHLIST_PATH, []);
  const downloaded = await loadJson(DOWNLOADED_PATH, {});

  if (!Array.isArray(wishlist) || wishlist.length === 0) {
    console.error('Wishlist is empty. Add icons to icons/wishlist.json first.');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(config.sourceUrlBase || 'https://www.streamlinehq.com/icons/pixel', {
    waitUntil: 'domcontentloaded',
  });

  await prompt('Log in to Streamline in the opened browser, then press Enter here to continue...');

  for (const item of wishlist) {
    const name = slugify(item.name || item.query || 'icon');
    if (downloaded[name]?.status === 'downloaded') {
      continue;
    }

    const destDir = path.join(ROOT, config.incomingDir || 'icons/incoming', name);
    await ensureDir(destDir);

    try {
      if (item.url) {
        await page.goto(item.url, { waitUntil: 'domcontentloaded' });
      } else {
        await page.goto(config.sourceUrlBase || 'https://www.streamlinehq.com/icons/pixel', {
          waitUntil: 'domcontentloaded',
        });
        const searchBox = await findSearchBox(page);
        if (!searchBox) {
          throw new Error('Search box not found on Streamline page.');
        }
        await searchBox.fill(item.query || item.name || '');
        await searchBox.press('Enter');
        await page.waitForTimeout(1200);

        const resultLink = await findResultLink(page);
        if (!resultLink) {
          downloaded[name] = {
            name,
            query: item.query,
            category: item.category,
            status: 'not_found',
            updatedAt: new Date().toISOString(),
          };
          continue;
        }

        await Promise.all([
          page.waitForLoadState('domcontentloaded'),
          resultLink.click(),
        ]);
      }

      const downloadResult = await downloadFromPage(page, destDir);
      if (!downloadResult) {
        throw new Error('Unable to locate a downloadable SVG or PNG on the icon page.');
      }

      downloaded[name] = {
        name,
        query: item.query,
        category: item.category,
        status: 'downloaded',
        format: downloadResult.format,
        sourceUrl: downloadResult.sourceUrl,
        updatedAt: new Date().toISOString(),
      };

      console.log(`Downloaded ${name} (${downloadResult.format}).`);
      await sleep(1200);
    } catch (error) {
      downloaded[name] = {
        name,
        query: item.query,
        category: item.category,
        status: 'error',
        error: error.message,
        updatedAt: new Date().toISOString(),
      };
      console.warn(`Failed to download ${name}: ${error.message}`);
    } finally {
      await fs.writeFile(DOWNLOADED_PATH, JSON.stringify(downloaded, null, 2));
    }
  }

  await browser.close();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
