const sharp = require("./node_modules/sharp");
const path = require("path");

async function verifyTransparency() {
  const pngPath = path.join(__dirname, "public", "hero-character.png");
  const { data, info } = await sharp(pngPath).raw().toBuffer({ resolveWithObject: true });

  console.log("Channels:", info.channels); // Must be 4 (RGBA)
  
  // Check top-left, top-right, bottom-left, bottom-right corner alpha values
  const corners = [
    { name: "Top-Left (0,0)", idx: 0 },
    { name: "Top-Right (1023,0)", idx: (1023) * 4 },
    { name: "Bottom-Left (0,575)", idx: (575 * 1024) * 4 },
    { name: "Bottom-Right (1023,575)", idx: (575 * 1024 + 1023) * 4 },
  ];

  corners.forEach(c => {
    const a = data[c.idx + 3];
    console.log(`${c.name} Alpha: ${a} (Transparent: ${a === 0})`);
  });
}

verifyTransparency().catch(console.error);
