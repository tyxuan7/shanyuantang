import sharp from "sharp";
import fs from "fs";

const sizes = [192, 512];

for (const size of sizes) {
  await sharp("public/logo.svg")
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
  console.log(`✅ icon-${size}.png`);
}
console.log("全部生成完成");
