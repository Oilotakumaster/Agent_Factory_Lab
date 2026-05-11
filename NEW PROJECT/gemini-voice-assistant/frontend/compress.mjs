import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public');
const files = fs.readdirSync(dir);

async function run() {
  for (const file of files) {
    if (file.endsWith('.jpeg') || file.endsWith('.jpg')) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.size > 1024 * 1024) { // larger than 1MB
        console.log(`Compressing ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);
        const tempPath = path.join(dir, 'temp_' + file);
        await sharp(filePath)
          .resize(800)
          .jpeg({ quality: 80 })
          .toFile(tempPath);
        fs.renameSync(tempPath, filePath);
        console.log(`Compressed ${file}`);
      }
    }
  }
}

run().catch(console.error);
