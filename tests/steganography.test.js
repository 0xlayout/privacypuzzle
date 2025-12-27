const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { hideData, extractData } = require('../lib/steganography');

const OUTPUT_DIR = path.join(__dirname, '../output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

describe('Advanced LSB Steganography Module', () => {
  let baseImageBuffer;

  beforeAll(async () => {
    baseImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .png()
      .composite([{
        input: Buffer.from(
          Array.from({ length: 100 * 100 * 4 }, (_, i) => (i % 257) ^ (i >> 8))
        ),
        raw: { width: 100, height: 100, channels: 4 },
        blend: 'over'
      }])
      .toBuffer();
  });

  test('hides and extracts maximum-size data without loss', async () => {
    const metadata = await sharp(baseImageBuffer).metadata();
    const maxBytes = Math.floor((metadata.width * metadata.height * metadata.channels) / 8) - 4;

    const largeData = Buffer.alloc(maxBytes, 'Confidential data repeated for maximum capacity test.'.repeat(100));
    const stegoImage = await hideData(baseImageBuffer, largeData);
    const extracted = await extractData(stegoImage);

    expect(extracted).toEqual(largeData);
  });

  test('gracefully fails when exceeding maximum capacity', async () => {
    const metadata = await sharp(baseImageBuffer).metadata();
    const maxBytes = Math.floor((metadata.width * metadata.height * metadata.channels) / 8) - 3;

    const oversizedData = Buffer.alloc(maxBytes);
    await expect(hideData(baseImageBuffer, oversizedData)).rejects.toThrow('Insufficient capacity');
  });

  test('resists moderate PNG recompression without critical data loss', async () => {
    const secret = Buffer.from('Message survives moderate recompression');
    const stego1 = await hideData(baseImageBuffer, secret);

    const recompressed = await sharp(stego1).png({ compressionLevel: 6 }).toBuffer();
    const extracted = await extractData(recompressed);

    expect(extracted.toString()).toBe(secret.toString());
  });

  test('detects deliberate corruption in critical LSB bits', async () => {
    const secret = Buffer.from('Message for integrity test');
    const stego = await hideData(baseImageBuffer, secret);

    const corrupted = Buffer.from(stego);
    for (let i = 0; i < corrupted.length * 0.01; i++) {
      const pos = Math.floor(Math.random() * corrupted.length);
      corrupted[pos] ^= 0xFF;
    }

    await expect(extractData(corrupted)).rejects.toThrow();
  });
});
