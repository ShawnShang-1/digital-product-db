/**
 * 生成应用图标 PNG（1024x1024）
 * 设计：极简风格，圆形背景 + 网格图案 + 芯片符号
 */
const fs = require('fs');

// 生成 PNG 文件（使用纯 JS 像素操作，不依赖 canvas）
function createPNG(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const typeData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeData));
    return Buffer.concat([length, typeData, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // 像素数据
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      const px = getPixel(x, y, width, height);
      rawData.push(px.r, px.g, px.b, px.a);
    }
  }

  // 简单的 deflate 实现
  function deflate(data) {
    const input = Buffer.from(data);
    const output = [0x78, 0x01]; // zlib header
    const blockSize = 65535;
    
    for (let i = 0; i < input.length; i += blockSize) {
      const block = input.slice(i, Math.min(i + blockSize, input.length));
      const isLast = i + blockSize >= input.length;
      output.push(isLast ? 1 : 0);
      const len = block.length;
      output.push(len & 0xFF, (len >> 8) & 0xFF, (~len) & 0xFF, ((~len) >> 8) & 0xFF);
      output.push(...block);
    }
    
    // 简单的 adler32
    let a = 1, b = 0;
    for (const byte of input) {
      a = (a + byte) % 65521;
      b = (b + a) % 65521;
    }
    output.push((b >> 8) & 0xFF, b & 0xFF, (a >> 8) & 0xFF, a & 0xFF);
    
    return Buffer.from(output);
  }

  const compressed = deflate(rawData);

  // IEND
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', iend)
  ]);
}

// 图标绘制逻辑
function getPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = w * 0.42;
  
  // 圆形裁剪
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  if (dist > r) return { r: 0, g: 0, b: 0, a: 0 };
  
  // 背景渐变
  const bg = lerp(0x1a1a2e, 0x16213e, dist / r);
  
  // 网格线
  const gridSize = w / 16;
  const isGridX = Math.abs(x % gridSize) < 2 || Math.abs(x % gridSize - gridSize) < 2;
  const isGridY = Math.abs(y % gridSize) < 2 || Math.abs(y % gridSize - gridSize) < 2;
  
  if (isGridX || isGridY) {
    return { r: (bg >> 16) & 0xFF, g: (bg >> 8) & 0xFF, b: bg & 0xFF, a: 60 };
  }
  
  // 中心芯片符号
  const chipSize = w * 0.25;
  const chipX = cx - chipSize / 2;
  const chipY = cy - chipSize / 2;
  
  if (x >= chipX && x < chipX + chipSize && y >= chipY && y < chipY + chipSize) {
    // 芯片边框
    const border = 8;
    const isBorder = x < chipX + border || x >= chipX + chipSize - border ||
                     y < chipY + border || y >= chipY + chipSize - border;
    
    if (isBorder) {
      return { r: 0x6c, g: 0xff, b: 0xc4, a: 255 };
    }
    
    // 内部电路图案
    const innerSize = chipSize - border * 2;
    const patternX = x - chipX - border;
    const patternY = y - chipY - border;
    
    if (patternY < innerSize / 3 && patternX < innerSize / 3) {
      return { r: 0x6c, g: 0xff, b: 0xc4, a: 120 };
    }
    if (patternY >= innerSize * 2 / 3 && patternX >= innerSize * 2 / 3) {
      return { r: 0x6c, g: 0xff, b: 0xc4, a: 120 };
    }
    if (patternX >= innerSize / 3 && patternX < innerSize * 2 / 3 && 
        patternY >= innerSize / 3 && patternY < innerSize * 2 / 3) {
      return { r: 0x6c, g: 0xff, b: 0xc4, a: 80 };
    }
  }
  
  return { r: (bg >> 16) & 0xFF, g: (bg >> 8) & 0xFF, b: bg & 0xFF, a: 255 };
}

function lerp(c1, c2, t) {
  const r1 = (c1 >> 16) & 0xFF, g1 = (c1 >> 8) & 0xFF, b1 = c1 & 0xFF;
  const r2 = (c2 >> 16) & 0xFF, g2 = (c2 >> 8) & 0xFF, b2 = c2 & 0xFF;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return (r << 16) | (g << 8) | b;
}

const png = createPNG(1024, 1024);
fs.writeFileSync('./assets/icons/app.png', png);
console.log('Created: ./assets/icons/app.png (1024x1024)');
