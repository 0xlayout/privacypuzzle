const sharp = require('sharp');

async function hideData(imageBuffer, data) {
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  const payload = Buffer.concat([lengthBuffer, data]);

  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  if (metadata.format !== 'png') throw new Error('Only PNG images are supported.');

  const rawData = await image.raw().toBuffer();
  const channels = metadata.channels;
  const bytesPerPixel = channels;
  const totalPixels = metadata.width * metadata.height;
  const availableBits = totalPixels * bytesPerPixel;

  if (payload.length * 8 > availableBits) {
    throw new Error('Insufficient capacity to hide data.');
  }

  const stegoData = Buffer.from(rawData);
  let bitIndex = 0;

  for (let i = 0; i < payload.length * 8; i++) {
    const byteIndex = Math.floor(bitIndex / 8);
    const bitPos = 7 - (bitIndex % 8);
    const bit = (payload[byteIndex] >> bitPos) & 1;

    const channelIndex = i % bytesPerPixel;
    const offset = Math.floor(i / bytesPerPixel) * bytesPerPixel + channelIndex;

    stegoData[offset] = (stegoData[offset] & 0xFE) | bit;
    bitIndex++;
  }

  return sharp(stegoData, {
    raw: { width: metadata.width, height: metadata.height, channels: metadata.channels }
  }).png().toBuffer();
}

async function extractData(imageBuffer) {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  if (metadata.format !== 'png') throw new Error('Only PNG images are supported.');

  const rawData = await image.raw().toBuffer();
  const channels = metadata.channels;
  const bytesPerPixel = channels;
  const totalBits = metadata.width * metadata.height * bytesPerPixel;

  let lengthBits = 0;
  for (let i = 0; i < 32; i++) {
    const channelIndex = i % bytesPerPixel;
    const offset = Math.floor(i / bytesPerPixel) * bytesPerPixel + channelIndex;
    lengthBits = (lengthBits << 1) | (rawData[offset] & 1);
  }

  const dataLength = lengthBits;
  if (dataLength * 8 > totalBits - 32) throw new Error('Invalid data length or corrupt image.');

  const extracted = Buffer.alloc(dataLength);
  let bitIndex = 32;

  for (let byteIdx = 0; byteIdx < dataLength; byteIdx++) {
    let byte = 0;
    for (let bitPos = 7; bitPos >= 0; bitPos--) {
      const channelIndex = bitIndex % bytesPerPixel;
      const offset = Math.floor(bitIndex / bytesPerPixel) * bytesPerPixel + channelIndex;
      byte = (byte << 1) | (rawData[offset] & 1);
      bitIndex++;
    }
    extracted[byteIdx] = byte;
  }

  return extracted;
}

module.exports = { hideData, extractData };