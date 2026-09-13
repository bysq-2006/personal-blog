import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  sharp = (await import('D:/bysq/.glbtools/node_modules/sharp/lib/index.js')).default;
}

const SRC = 'D:/bysq_D';
const DST = 'D:/bysq/paper-home/assets/sprites';

const JOBS = [
  ['Pt8DW.jpg', 'coast.png'],
  ['yun1.jpg', 'cloud-1.png'],
  ['yun2.jpg', 'cloud-2.png'],
  ['yun3.jpg', 'cloud-3.png'],
];

fs.mkdirSync(DST, { recursive: true });

for (const [srcName, dstName] of JOBS) {
  const src = path.join(SRC, srcName);
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const luma = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const ink = 1 - luma;
    const a = Math.max(0, Math.min(1, (ink - 0.04) / 0.22));
    out[i * 4] = 42;
    out[i * 4 + 1] = 38;
    out[i * 4 + 2] = 34;
    out[i * 4 + 3] = Math.round(a * 255);
  }
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (out[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 8;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const crop = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    out.copy(
      crop,
      y * cw * 4,
      ((minY + y) * w + minX) * 4,
      ((minY + y) * w + minX + cw) * 4
    );
  }
  const dst = path.join(DST, dstName);
  await sharp(crop, { raw: { width: cw, height: ch, channels: 4 } }).png().toFile(dst);
  console.log('wrote', dst, cw, ch);
}
