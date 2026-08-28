const sharp = require("./node_modules/sharp");
const path = require("path");
const fs = require("fs");

async function generateTrueTransparentPNG() {
  const userBlackBgImg = "C:\\Users\\megwa\\.gemini\\antigravity-ide\\brain\\797ff308-eff2-418a-9a77-91aec057e29d\\.user_uploaded\\media_1787925105899.jpg";
  const outputPng = path.join(__dirname, "public", "hero-character.png");

  console.log("Reading user image with sharp...");
  
  const { data, info } = await sharp(userBlackBgImg)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  console.log(`Image dimensions: ${width}x${height}`);

  let transparentPixelsCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const maxVal = Math.max(r, g, b);

    // If pixel is black background
    if (maxVal < 16) {
      data[i + 3] = 0; // 100% transparent
      transparentPixelsCount++;
    } else if (maxVal < 50 && (r > g && r > b)) {
      // Soft red glow / embers fading to black
      const alphaFactor = (maxVal - 16) / 34;
      data[i + 3] = Math.round(alphaFactor * 255);
    } else if (maxVal < 40) {
      // Soft shadow transition
      const alphaFactor = (maxVal - 16) / 24;
      data[i + 3] = Math.round(alphaFactor * 255);
    } else {
      data[i + 3] = 255; // 100% opaque
    }
  }

  console.log(`Made ${transparentPixelsCount} pixels 100% transparent (${Math.round(transparentPixelsCount / (width * height) * 100)}% of image)`);

  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outputPng);

  console.log("Successfully generated transparent PNG at:", outputPng);
  
  // Copy to hero-creator.png as well
  fs.copyFileSync(outputPng, path.join(__dirname, "public", "hero-creator.png"));
}

generateTrueTransparentPNG().catch(console.error);
