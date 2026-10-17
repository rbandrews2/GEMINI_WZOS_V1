import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const iconSvg = fs.readFileSync('public/icon.svg');
  const maskableSvg = fs.readFileSync('public/icon-maskable.svg');

  console.log('Rendering pwa-512x512.png...');
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');

  console.log('Rendering pwa-192x192.png...');
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');

  console.log('Rendering apple-touch-icon.png...');
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  console.log('Rendering pwa-maskable-512x512.png...');
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-maskable-512x512.png');

  console.log('Rendering favicon.png (64x64)...');
  await sharp(iconSvg)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.png');

  console.log('Saving to src/assets/images/wzos_icon_logo.png...');
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile('src/assets/images/wzos_icon_logo.png');

  console.log('All PWA icon assets generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
