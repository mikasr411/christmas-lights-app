const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function buildIcons() {
  const svgPath = path.join(__dirname, '../assets/icon.svg');
  const assetsPath = path.join(__dirname, '../assets');
  
  console.log('Building icons from SVG...');
  
  try {
    // Create PNG versions for different sizes
    const sizes = [16, 32, 48, 64, 128, 256, 512];
    
    for (const size of sizes) {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(assetsPath, `icon-${size}.png`));
      console.log(`Created icon-${size}.png`);
    }
    
    // Create main icon.png (256x256)
    await sharp(svgPath)
      .resize(256, 256)
      .png()
      .toFile(path.join(assetsPath, 'icon.png'));
    console.log('Created main icon.png');
    
    // Create ICO file for Windows
    await sharp(svgPath)
      .resize(256, 256)
      .png()
      .toFile(path.join(assetsPath, 'icon.ico'));
    console.log('Created icon.ico');
    
    console.log('✅ All icons built successfully!');
    
  } catch (error) {
    console.error('❌ Error building icons:', error);
    process.exit(1);
  }
}

buildIcons();


