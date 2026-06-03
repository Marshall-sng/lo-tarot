const fs = require('fs');

function getWebpSize(filepath) {
  const buf = fs.readFileSync(filepath);
  // WebP files format: RIFF....WEBPVP8
  // VP8 chunk can be VP8, VP8L, VP8X
  const riff = buf.toString('ascii', 0, 4);
  const webp = buf.toString('ascii', 8, 12);
  if (riff !== 'RIFF' || webp !== 'WEBP') {
    throw new Error('Not a valid WEBP file');
  }
  
  const type = buf.toString('ascii', 12, 16);
  if (type === 'VP8 ') {
    // Simple format
    const width = buf.readUInt16LE(26) & 0x3fff;
    const height = buf.readUInt16LE(28) & 0x3fff;
    return { width, height, type };
  } else if (type === 'VP8L') {
    // Lossless format
    const n = buf.readUInt32LE(21);
    const width = (n & 0x3fff) + 1;
    const height = ((n >> 14) & 0x3fff) + 1;
    return { width, height, type };
  } else if (type === 'VP8X') {
    // Extended format
    const width = (buf.readUInt32LE(24) & 0xffffff) + 1;
    const height = (buf.readUInt32LE(27) & 0xffffff) + 1;
    return { width, height, type };
  }
  return { error: 'Unknown VP8 format: ' + type };
}

try {
  console.log('bg_desktop:', getWebpSize('bg_desktop.webp'));
  console.log('bg_mobile:', getWebpSize('bg_mobile.webp'));
} catch (e) {
  console.error(e);
}
