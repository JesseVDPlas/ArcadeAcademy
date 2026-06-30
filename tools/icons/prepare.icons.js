const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'icons', 'config.json');
const WISHLIST_PATH = path.join(ROOT, 'icons', 'wishlist.json');
const DOWNLOADED_PATH = path.join(ROOT, 'icons', 'downloaded.json');

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

const toPosix = (value) => value.split(path.sep).join('/');

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

const ensureRelativeRequire = (fromDir, filePath) => {
  const rel = toPosix(path.relative(fromDir, filePath));
  return rel.startsWith('.') ? rel : `./${rel}`;
};

const toCamel = (value) => {
  const parts = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  if (!parts.length) return 'icon';
  return parts
    .map((part, index) =>
      index === 0 ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`
    )
    .join('');
};

const findSourceFile = async (dirPath) => {
  const svgPath = path.join(dirPath, 'source.svg');
  const pngPath = path.join(dirPath, 'source.png');
  try {
    await fs.access(svgPath);
    return { path: svgPath, format: 'svg' };
  } catch (error) {
    // ignore
  }
  try {
    await fs.access(pngPath);
    return { path: pngPath, format: 'png' };
  } catch (error) {
    return null;
  }
};

const loadSvgBuffer = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  return buffer;
};

const renderBase = async ({ source, format, size }) => {
  if (format === 'svg') {
    const buffer = await loadSvgBuffer(source);
    return sharp(buffer, { density: 300 }).resize(size, size, { kernel: 'nearest' }).png();
  }
  return sharp(source).resize(size, size, { kernel: 'nearest' }).png();
};

const run = async () => {
  const config = await loadJson(CONFIG_PATH, {});
  const wishlist = await loadJson(WISHLIST_PATH, []);
  const downloaded = await loadJson(DOWNLOADED_PATH, {});

  const baseSize = config.baseSize || 24;
  const hudBaseSize = config.hudBaseSize || 32;
  const scales = Array.isArray(config.scales) ? config.scales : [1, 2, 3];
  const incomingDir = path.join(ROOT, config.incomingDir || 'icons/incoming');
  const outputDir = path.join(ROOT, config.outputDir || 'assets/icons/pixel');
  const manifestJsonPath = path.join(
    ROOT,
    config.manifestJsonPath || 'assets/icons/pixel/icons.manifest.json'
  );
  const manifestTsPath = path.join(
    ROOT,
    config.manifestTsPath || 'assets/icons/pixel/icons.manifest.ts'
  );
  const attributionPath = path.join(ROOT, config.attributionPath || 'icons/ATTRIBUTION.md');
  const emitJson = config.emitJson !== false;
  const manifestDir = path.dirname(manifestTsPath);

  const manifest = {};
  const attributionLines = [
    '# Streamline Pixel icon attribution',
    '',
    'The following icons are sourced from Streamline Pixel:',
    '',
  ];

  for (const item of wishlist) {
    const rawName = item.name || item.query || 'icon';
    const fileBase = slugify(rawName);
    const manifestKey = toCamel(rawName);
    const category = (item.category || 'uncategorized').toLowerCase();
    const sourceDir = path.join(incomingDir, fileBase);
    const source = await findSourceFile(sourceDir);
    const iconBaseSize = item.baseSize || (category === 'hud' ? hudBaseSize : baseSize);
    const iconOutputDir = path.join(outputDir, category, fileBase);
    await ensureDir(iconOutputDir);

    const pngPaths = {};
    const pngRequires = {};
    let svgPath = null;
    let svgRequire = null;

    if (!source) {
      console.warn(`Missing source for ${manifestKey}. Run npm run icons:fetch first.`);
    } else {
      for (const scale of scales) {
        const size = iconBaseSize * scale;
        const outputName = scale === 1 ? `${fileBase}.png` : `${fileBase}@${scale}x.png`;
        const outputPath = path.join(iconOutputDir, outputName);
        const pipeline = await renderBase({ source: source.path, format: source.format, size });
        await pipeline.png({ compressionLevel: 9, palette: true }).toFile(outputPath);
        pngPaths[`${scale}x`] = toPosix(path.relative(ROOT, outputPath));
        pngRequires[`${scale}x`] = ensureRelativeRequire(manifestDir, outputPath);
      }

      if (source.format === 'svg') {
        const destSvg = path.join(iconOutputDir, 'source.svg');
        await fs.copyFile(source.path, destSvg);
        svgPath = toPosix(path.relative(ROOT, destSvg));
        svgRequire = ensureRelativeRequire(manifestDir, destSvg);
      }
    }

    const sourceUrl = downloaded[fileBase]?.sourceUrl || item.url || '';
    manifest[manifestKey] = {
      category,
      baseSize: iconBaseSize,
      png: pngPaths,
      svg: svgPath,
      pngModule: pngRequires,
      svgModule: svgRequire,
      sourceUrl,
      tags: item.tags || [],
    };

    attributionLines.push(`- ${manifestKey}${sourceUrl ? ` (${sourceUrl})` : ''}`);
  }

  await ensureDir(path.dirname(manifestTsPath));
  const entries = Object.entries(manifest)
    .map(([key, entry]) => {
      const pngModule = entry.pngModule || {};
      const svgModule = entry.svgModule ? `require('${entry.svgModule}')` : 'null';
      const pngLines = Object.entries(pngModule)
        .map(([scale, relPath]) => `      '${scale}': require('${relPath}')`)
        .join(',\n');
      const tags = JSON.stringify(entry.tags || []);
      const sourceUrl = entry.sourceUrl ? JSON.stringify(entry.sourceUrl) : '""';
      return `  ${JSON.stringify(key)}: {\n    category: ${JSON.stringify(entry.category)},\n    baseSize: ${entry.baseSize},\n    tags: ${tags},\n    sourceUrl: ${sourceUrl},\n    png: {\n${pngLines}\n    },\n    svg: ${svgModule}\n  }`;
    })
    .join(',\n');

  const tsContent = `const manifest = {\n${entries}\n} as const;\n\nexport default manifest;\nexport type IconName = keyof typeof manifest;\n`;

  await fs.writeFile(manifestTsPath, tsContent);

  if (emitJson) {
    await ensureDir(path.dirname(manifestJsonPath));
    const manifestForJson = Object.fromEntries(
      Object.entries(manifest).map(([key, entry]) => [
        key,
        {
          category: entry.category,
          baseSize: entry.baseSize,
          tags: entry.tags,
          sourceUrl: entry.sourceUrl,
          png: entry.png,
          svg: entry.svg,
        },
      ])
    );
    await fs.writeFile(manifestJsonPath, JSON.stringify(manifestForJson, null, 2));
  }
  await fs.writeFile(attributionPath, `${attributionLines.join('\n')}\n`);

  console.log(`Prepared icons written to ${outputDir}`);
  console.log(`Manifest written to ${manifestTsPath}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
