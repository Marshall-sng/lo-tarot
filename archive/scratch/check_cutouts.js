const fs = require('fs');
const path = require('path');

function getPngSize(filepath) {
  const buf = fs.readFileSync(filepath);
  // PNG files format starts with 89 50 4E 47 0D 0A 1A 0A
  // IHDR chunk starts at byte 12. Length is 4 bytes, name is 'IHDR' (4 bytes), width is 4 bytes, height is 4 bytes
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

const dir = 'd:\\gemini-lo-taro\\cutouts';
const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith('.png')) {
    const size = getPngSize(path.join(dir, file));
    console.log(file, ':', size.width, 'x', size.height);
  }
}
