/**
 * Recenter the cover image: find the visual content bounds, then shift the
 * image so that content is centered in the frame. Saves to public/cover-centered.png
 * Run: node scripts/recenter-cover.cjs
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const inputPath = path.join(root, "public", "cover.png");
const outputPath = path.join(root, "public", "cover-centered.png");

const LUMINANCE_THRESHOLD = 240;

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

async function main() {
  if (!fs.existsSync(inputPath)) {
    console.error("Not found:", inputPath);
    process.exit(1);
  }

  const image = sharp(inputPath);
  const meta = await image.metadata();
  const w = meta.width;
  const h = meta.height;
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const lum = luminance(r, g, b);
      const isContent = a > 20 && lum < LUMINANCE_THRESHOLD;
      if (isContent) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  const contentCenterX = (minX + maxX) / 2;
  const contentCenterY = (minY + maxY) / 2;
  const imageCenterX = w / 2;
  const imageCenterY = h / 2;
  const shiftX = Math.round(imageCenterX - contentCenterX);
  const shiftY = Math.round(imageCenterY - contentCenterY);

  const maxShiftX = Math.round(w * 0.08);
  const maxShiftY = Math.round(h * 0.08);
  const clampX = Math.max(-maxShiftX, Math.min(maxShiftX, shiftX));
  const clampY = Math.max(-maxShiftY, Math.min(maxShiftY, shiftY));

  const imageBuffer = await sharp(inputPath).toBuffer();

  await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: { r: 245, g: 244, b: 240, alpha: 1 },
    },
  })
    .composite([{ input: imageBuffer, left: clampX, top: clampY }])
    .png()
    .toFile(outputPath);

  console.log("Wrote", outputPath);
  console.log("Shift applied: x =", clampX, ", y =", clampY);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
