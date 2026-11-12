const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourcePath = path.join(__dirname, '..', 'public', 'app-icon-source.jpg');
const cleanPath = path.join(__dirname, '..', 'public', 'app-icon-clean.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');
const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to create an authentic multi-size ICO file containing PNGs
function createIcoFromPngs(pngBuffers) {
  const numImages = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO type
  header.writeUInt16LE(numImages, 4);

  let offset = 6 + (16 * numImages);
  const dirEntries = [];

  for (const { buffer, size } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2);                      // Color palette
    entry.writeUInt8(0, 3);                      // Reserved
    entry.writeUInt16LE(1, 4);                   // Color planes
    entry.writeUInt16LE(32, 6);                  // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8);       // Image size in bytes
    entry.writeUInt32LE(offset, 12);             // Image data offset
    dirEntries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

async function prepareCleanIcon() {
  console.log('Extracting and preparing clean app icon from:', sourcePath);
  const metadata = await sharp(sourcePath).metadata();
  console.log('Source image dimensions:', metadata.width, metadata.height);

  // Center squircle in 352x339 image:
  // Center is at X=176, Y=168.
  // Squircle size is approx 308x308.
  const size = 308;
  const left = Math.round(176 - size / 2); // 22
  const top = Math.round(168 - size / 2);  // 14

  const cropped = await sharp(sourcePath)
    .extract({ left: 22, top: 14, width: size, height: size })
    .toBuffer();

  // Create rounded squircle mask with smooth anti-aliased corners
  const radius = 68;
  const maskSvg = `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#ffffff"/></svg>`;

  await sharp(cropped)
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toFile(cleanPath);

  console.log('Saved clean transparent squircle icon to:', cleanPath);
  return cleanPath;
}

async function generateIcons() {
  const cleanIcon = await prepareCleanIcon();

  // 1. Standard square PWA icons (192x192 & 512x512)
  await sharp(cleanIcon)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outputDir, 'icon-192x192.png'));
  console.log('✓ Created icons/icon-192x192.png');

  await sharp(cleanIcon)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outputDir, 'icon-512x512.png'));
  console.log('✓ Created icons/icon-512x512.png');

  // Root public copies
  await sharp(cleanIcon)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ Created public/icon-192.png');

  await sharp(cleanIcon)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ Created public/icon-512.png');

  // 2. Apple Touch Icon (180x180 solid background for iOS Home Screen)
  const innerApple = 160;
  const resizedApple = await sharp(cleanIcon)
    .resize(innerApple, innerApple, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 26, g: 25, b: 77, alpha: 1 } // #1a194d deep cosmic navy/violet
    }
  })
    .composite([{ input: resizedApple, top: 10, left: 10 }])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created public/apple-touch-icon.png');

  // 3. Android Maskable Icons (Safe zone: center 80% circle, padded so launcher masks never clip)
  const brandBg = { r: 27, g: 27, b: 77, alpha: 1 }; // #1b1b4d

  const pad192 = Math.round(192 * 0.1);
  const inner192 = 192 - (pad192 * 2);
  const resized192 = await sharp(cleanIcon)
    .resize(inner192, inner192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: 192, height: 192, channels: 4, background: brandBg }
  })
    .composite([{ input: resized192, top: pad192, left: pad192 }])
    .png()
    .toFile(path.join(outputDir, 'icon-maskable-192x192.png'));
  console.log('✓ Created icons/icon-maskable-192x192.png');

  const pad512 = Math.round(512 * 0.1);
  const inner512 = 512 - (pad512 * 2);
  const resized512 = await sharp(cleanIcon)
    .resize(inner512, inner512, { fit: 'contain', background: brandBg })
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: brandBg }
  })
    .composite([{ input: resized512, top: pad512, left: pad512 }])
    .png()
    .toFile(path.join(outputDir, 'icon-maskable-512x512.png'));
  console.log('✓ Created icons/icon-maskable-512x512.png');

  // 4. Favicons (16x16, 32x32, 48x48)
  const fav16 = await sharp(cleanIcon).resize(16, 16).png().toBuffer();
  const fav32 = await sharp(cleanIcon).resize(32, 32).png().toBuffer();
  const fav48 = await sharp(cleanIcon).resize(48, 48).png().toBuffer();

  await sharp(fav32).toFile(path.join(outputDir, 'favicon-32x32.png'));
  await sharp(fav16).toFile(path.join(outputDir, 'favicon-16x16.png'));
  await sharp(fav32).toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(fav16).toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✓ Created favicon PNGs (16x16, 32x32)');

  // Authentic multi-size ICO (16, 32, 48) - Next.js App Router serves src/app/favicon.ico
  const icoData = createIcoFromPngs([
    { buffer: fav16, size: 16 },
    { buffer: fav32, size: 32 },
    { buffer: fav48, size: 48 }
  ]);
  if (fs.existsSync(appDir)) {
    fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoData);
  }
  console.log('✓ Created multi-resolution favicon.ico in src/app/');

  // 5. High-Resolution Website Thumbnail & OpenGraph Social Card (1200 x 630)
  console.log('Generating 1200x630 OpenGraph and website thumbnail...');
  const iconOnCard = await sharp(cleanIcon)
    .resize(360, 360, { fit: 'contain' })
    .png()
    .toBuffer();

  const ogSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#08081a"/>
        <stop offset="50%" stop-color="#14133b"/>
        <stop offset="100%" stop-color="#0b0b24"/>
      </linearGradient>
      <radialGradient id="glowGlow" cx="280" cy="315" r="320" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45"/>
        <stop offset="60%" stop-color="#ec4899" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#08081a" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="cornerGlow" cx="1100" cy="100" r="280" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#08081a" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)"/>
    <rect width="1200" height="630" fill="url(#glowGlow)"/>
    <rect width="1200" height="630" fill="url(#cornerGlow)"/>

    <!-- Subtle Grid Lines -->
    <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
      <line x1="0" y1="105" x2="1200" y2="105"/>
      <line x1="0" y1="210" x2="1200" y2="210"/>
      <line x1="0" y1="315" x2="1200" y2="315"/>
      <line x1="0" y1="420" x2="1200" y2="420"/>
      <line x1="0" y1="525" x2="1200" y2="525"/>
      <line x1="200" y1="0" x2="200" y2="630"/>
      <line x1="400" y1="0" x2="400" y2="630"/>
      <line x1="600" y1="0" x2="600" y2="630"/>
      <line x1="800" y1="0" x2="800" y2="630"/>
      <line x1="1000" y1="0" x2="1000" y2="630"/>
    </g>

    <!-- Outer card border -->
    <rect x="20" y="20" width="1160" height="590" rx="28" ry="28" fill="none" stroke="#6366f1" stroke-opacity="0.25" stroke-width="1.5"/>

    <!-- Typography & Right Column Content -->
    <!-- Brand Badge -->
    <g transform="translate(500, 110)">
      <rect x="0" y="0" width="220" height="38" rx="19" ry="19" fill="#6366f1" fill-opacity="0.2" stroke="#818cf8" stroke-opacity="0.4" stroke-width="1"/>
      <circle cx="20" cy="19" r="5" fill="#38bdf8"/>
      <text x="36" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="800" letter-spacing="2" fill="#c7d2fe">LINGOLANDVERSE</text>
    </g>

    <!-- Main Headline -->
    <g transform="translate(500, 195)">
      <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="46" font-weight="900" fill="#ffffff" letter-spacing="-0.5">
        Interactive ESL, Math
      </text>
      <text y="54" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="46" font-weight="900" fill="#38bdf8" letter-spacing="-0.5">
        &amp; Science Classroom Games
      </text>
    </g>

    <!-- Subtitle / Value Prop -->
    <g transform="translate(500, 315)">
      <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="500" fill="#94a3b8">
        79+ CEFR Games • AI Presentation Maker • Graded Reading Lab
      </text>
      <text y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="500" fill="#94a3b8">
        Spaced Repetition Flashcards • 100% Free for Teachers &amp; Students
      </text>
    </g>

    <!-- Feature Pill Badges -->
    <g transform="translate(500, 420)">
      <!-- Pill 1: Smartboard Ready -->
      <rect x="0" y="0" width="180" height="42" rx="14" ry="14" fill="#0f172a" fill-opacity="0.8" stroke="#334155" stroke-width="1.2"/>
      <text x="90" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#f1f5f9">🖥️ Smartboard Ready</text>

      <!-- Pill 2: Installable PWA -->
      <rect x="195" y="0" width="200" height="42" rx="14" ry="14" fill="#0f172a" fill-opacity="0.8" stroke="#6366f1" stroke-opacity="0.6" stroke-width="1.2"/>
      <text x="295" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#a5b4fc">📱 Installable PWA App</text>

      <!-- Pill 3: 100% Free -->
      <rect x="410" y="0" width="145" height="42" rx="14" ry="14" fill="#0f172a" fill-opacity="0.8" stroke="#10b981" stroke-opacity="0.6" stroke-width="1.2"/>
      <text x="482" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#6ee7b7">✨ 100% Free</text>
    </g>

    <!-- Footer URL -->
    <g transform="translate(500, 520)">
      <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace" font-size="16" font-weight="600" fill="#64748b" letter-spacing="1">
        WWW.LINGOLANDVERSE.COM
      </text>
    </g>
  </svg>
  `;

  const ogComposite = await sharp(Buffer.from(ogSvg))
    .composite([
      {
        input: iconOnCard,
        top: 135,
        left: 90
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'opengraph-image.png'));

  // Also copy to twitter-image.png and thumbnail.png
  fs.copyFileSync(path.join(publicDir, 'opengraph-image.png'), path.join(publicDir, 'twitter-image.png'));
  fs.copyFileSync(path.join(publicDir, 'opengraph-image.png'), path.join(publicDir, 'thumbnail.png'));
  console.log('✓ Created 1200x630 opengraph-image.png, twitter-image.png, and thumbnail.png');

  // Square Thumbnail (512x512) for website cards / rich bookmarks
  const squareThumbSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sqBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0a1f"/>
        <stop offset="100%" stop-color="#181844"/>
      </linearGradient>
      <radialGradient id="sqGlow" cx="256" cy="220" r="220" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#0a0a1f" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="512" height="512" fill="url(#sqBg)"/>
    <rect width="512" height="512" fill="url(#sqGlow)"/>
    <rect x="16" y="16" width="480" height="480" rx="36" ry="36" fill="none" stroke="#6366f1" stroke-opacity="0.3" stroke-width="2"/>
    <text x="256" y="445" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" letter-spacing="1" fill="#ffffff">LINGOLANDVERSE</text>
    <text x="256" y="475" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#94a3b8">Interactive Educational Games</text>
  </svg>
  `;

  const squareIcon = await sharp(cleanIcon)
    .resize(320, 320, { fit: 'contain' })
    .png()
    .toBuffer();

  await sharp(Buffer.from(squareThumbSvg))
    .composite([
      {
        input: squareIcon,
        top: 60,
        left: 96
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'thumbnail-square.png'));
  console.log('✓ Created 512x512 thumbnail-square.png');

  console.log('\n🎉 ALL ICONS AND THUMBNAILS GENERATED SUCCESSFULLY!');
}

generateIcons().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
