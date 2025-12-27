const fs = require('node:fs');
const path = require('node:path');
const { encrypt, decrypt } = require('../lib/encryptation');
const { hideData, extractData } = require('../lib/steganography');
const { generateNonogram, renderNonogramPuzzle } = require('../lib/puzzleGenerator');

const OUTPUT_DIR = path.join(__dirname, '../output');

describe('End-to-End Integration: Message Hiding and Retrieval', () => {
  const message = 'Highly sensitive confidential message – Full integration test – 27 December 2025';
  const password = 'HighEntropy2025!@#NISTCompliant';

  test('full workflow preserves message integrity across all layers', async () => {
    // 1. Generate puzzle
    const { rowHints, colHints } = generateNonogram(20, 20, 0.5);
    const puzzleImage = await renderNonogramPuzzle(rowHints, colHints, 45);

    // 2. Encrypt
    const encrypted = encrypt(message, password);

    // 3. Hide
    const stegoImage = await hideData(puzzleImage, encrypted);

    // 4. Temporarily save to simulate real usage
    const tempPath = path.join(OUTPUT_DIR, 'integration-test-puzzle.png');
    fs.writeFileSync(tempPath, stegoImage);

    // 5. Extract
    const extractedEncrypted = await extractData(stegoImage);

    // 6. Decrypt
    const recovered = decrypt(extractedEncrypted, password);

    expect(recovered).toBe(message);

    // Cleanup
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }, 15000); 
});
