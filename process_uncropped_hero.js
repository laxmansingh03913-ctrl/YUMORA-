const sharp = require("./node_modules/sharp");
const path = require("path");
const fs = require("fs");

async function processUncroppedFullHero() {
  const inputJpg = "C:\\Users\\megwa\\.gemini\\antigravity-ide\\brain\\797ff308-eff2-418a-9a77-91aec057e29d\\yomika_hero_full_character_1787933188772.jpg";
  const outputPng = path.join(__dirname, "public", "hero-character.png");
  const outputWebp = path.join(__dirname, "public", "hero-character.webp");

  console.log("Loading uncropped full character image with sharp...");
  const { data, info } = await sharp(inputJpg)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = 4;
  console.log(`Image dimensions: ${width}x${height}`);

  const visited = new Uint8Array(width * height);
  const queue = [];

  function getIdx(x, y) {
    return (y * width + x) * channels;
  }

  function isExteriorWhite(x, y) {
    const idx = getIdx(x, y);
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Threshold for white canvas background
    return r > 235 && g > 235 && b > 235;
  }

  // Push all 4 border pixels
  for (let x = 0; x < width; x++) {
    if (isExteriorWhite(x, 0)) { queue.push([x, 0]); visited[0 * width + x] = 1; }
    if (isExteriorWhite(x, height - 1)) { queue.push([x, height - 1]); visited[(height - 1) * width + x] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isExteriorWhite(0, y)) { queue.push([0, y]); visited[y * width + 0] = 1; }
    if (isExteriorWhite(width - 1, y)) { queue.push([width - 1, y]); visited[y * width + (width - 1)] = 1; }
  }

  let transparentPixels = 0;
  let head = 0;
  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    const idx = getIdx(cx, cy);
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const brightness = (r + g + b) / 3;
    if (brightness > 245) {
      data[idx + 3] = 0; // 100% Transparent
      transparentPixels++;
    } else if (brightness > 235) {
      data[idx + 3] = Math.round(((255 - brightness) / 10) * 255); // Smooth anti-alias
      transparentPixels++;
    }

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const vIdx = ny * width + nx;
        if (!visited[vIdx] && isExteriorWhite(nx, ny)) {
          visited[vIdx] = 1;
          queue.push([nx, ny]);
        }
      }
    }
  }

  console.log(`Successfully made ${transparentPixels} exterior pixels transparent (${Math.round((transparentPixels / (width * height)) * 100)}%)`);

  // Verify bottom border (y = height - 1)
  let nonTransparentBottom = 0;
  const lastY = height - 1;
  for (let x = 0; x < width; x++) {
    if (data[(lastY * width + x) * 4 + 3] > 0) nonTransparentBottom++;
  }
  console.log(`Non-transparent pixels in bottom row: ${nonTransparentBottom} (must be 0 for zero bottom crop)`);

  // Save 32-bit Transparent PNG
  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPng);

  // Save Transparent WebP
  await sharp(data, { raw: { width, height, channels: 4 } })
    .webp({ quality: 96, alphaQuality: 100, lossless: false })
    .toFile(outputWebp);

  console.log("Successfully saved uncropped full-body hero PNG & WebP to public!");
  fs.copyFileSync(outputPng, path.join(__dirname, "public", "hero-creator.png"));
}

processUncroppedFullHero().catch(console.error);
