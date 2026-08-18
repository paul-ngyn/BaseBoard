// One-off script: rasterizes the Baseboard brand mark (wood-grain bars on an
// accent square) into the PNG sizes iOS/Android need for home-screen icons.
// Run with: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SIZE = 512;
const svg = `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SIZE}" height="${SIZE}" fill="#8a5a2b"/>
  <g transform="translate(96, 176)">
    <rect x="0" y="0" width="320" height="56" rx="14" fill="#f4efe6"/>
    <rect x="0" y="92" width="320" height="56" rx="14" fill="#e7ddcc"/>
    <rect x="0" y="184" width="320" height="56" rx="14" fill="#c39a5a"/>
  </g>
</svg>`;

mkdirSync('public/icons', { recursive: true });

const targets = [
  { file: 'public/apple-touch-icon.png', size: 180 },
  { file: 'public/icons/icon-192.png', size: 192 },
  { file: 'public/icons/icon-512.png', size: 512 },
  { file: 'public/icons/maskable-512.png', size: 512, padded: true },
];

for (const t of targets) {
  const base = sharp(Buffer.from(svg)).resize(SIZE, SIZE);
  const pipeline = t.padded
    ? sharp(Buffer.from(svg))
        .resize(Math.round(SIZE * 0.7), Math.round(SIZE * 0.7))
        .extend({
          top: Math.round(SIZE * 0.15),
          bottom: Math.round(SIZE * 0.15),
          left: Math.round(SIZE * 0.15),
          right: Math.round(SIZE * 0.15),
          background: '#8a5a2b',
        })
    : base;
  await pipeline.resize(t.size, t.size).png().toFile(t.file);
  console.log('wrote', t.file);
}
