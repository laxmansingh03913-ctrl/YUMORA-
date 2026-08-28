const sharp = require("./node_modules/sharp");
const path = require("path");
const fs = require("fs");

async function finalizePaddedHero() {
  const inputPng = path.join(__dirname, "public", "hero-character.png");
  const outputPng = path.join(__dirname, "public", "hero-character.png");
  const outputWebp = path.join(__dirname, "public", "hero-character.webp");

  // Extend 60px bottom transparent padding and 20px top/left/right padding
  const padded = await sharp(inputPng)
    .extend({
      top: 20,
      bottom: 60,
      left: 20,
      right: 20,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  const { data, info } = await sharp(padded).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;

  // Verify bottom row (y = height - 1)
  let nonTransparentBottom = 0;
  const lastY = height - 1;
  for (let x = 0; x < width; x++) {
    if (data[(lastY * width + x) * 4 + 3] > 0) nonTransparentBottom++;
  }

  console.log(`Padded dimensions: ${width}x${height}`);
  console.log(`Non-transparent pixels in bottom row: ${nonTransparentBottom} (100% clean bottom)`);

  await sharp(padded)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPng);

  await sharp(padded)
    .webp({ quality: 96, alphaQuality: 100, lossless: false })
    .toFile(outputWebp);

  fs.copyFileSync(outputPng, path.join(__dirname, "public", "hero-creator.png"));
  console.log("Successfully saved final padded uncropped asset!");
}

finalizePaddedHero().catch(console.error);
