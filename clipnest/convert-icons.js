const sharp = require('sharp');
const path = require('path');

const icons = [
  { input: 'icons/icon16.svg',  output: 'icons/icon16.png',  size: 16  },
  { input: 'icons/icon48.svg',  output: 'icons/icon48.png',  size: 48  },
  { input: 'icons/icon128.svg', output: 'icons/icon128.png', size: 128 },
];

async function convertAll() {
  for (const icon of icons) {
    try {
      await sharp(icon.input)
        .resize(icon.size, icon.size)
        .png()
        .toFile(icon.output);
      console.log(`✅ 已生成：${icon.output}`);
    } catch (err) {
      console.error(`❌ 生成失败：${icon.output}`, err.message);
    }
  }
  console.log('\n🎉 所有图标生成完毕！');
}

convertAll();