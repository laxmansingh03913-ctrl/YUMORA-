const sharp = require("./node_modules/sharp");
const path = require("path");

async function checkExactTransparency() {
  const pngPath = path.join(__dirname, "public", "hero-character.png");
  const { data, info } = await sharp(pngPath).raw().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  console.log(`Dimensions: ${width}x${height}`);

  const points = [
    { name: "Top-Left (0,0)", x: 0, y: 0 },
    { name: "Top-Right (w-1,0)", x: width - 1, y: 0 },
    { name: "Bottom-Left (0,h-1)", x: 0, y: height - 1 },
    { name: "Bottom-Right (w-1,h-1)", x: width - 1, y: height - 1 },
    { name: "Top-Mid (w/2, 0)", x: Math.floor(width / 2), y: 0 },
    { name: "Left-Mid (0, h/2)", x: 0, y: Math.floor(height / 2) },
    { name: "Right-Mid (w-1, h/2)", x: width - 1, y: Math.floor(height / 2) },
  ];

  points.forEach(p => {
    const idx = (p.y * width + p.x) * 4;
    const a = data[idx + 3];
    console.log(`${p.name}: Alpha = ${a} (${a === 0 ? "Transparent" : "Opaque"})`);
  });
}

checkExactTransparency().catch(console.error);
