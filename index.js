#!/usr/bin/env node
const { program } = require('commander');
const fs = require('node:fs');
const path = require('node:path');
const { encrypt, decrypt } = require('./lib/encryption');
const { hideData, extractData } = require('./lib/steganography');
const { generateNonogram, renderNonogramPuzzle } = require('./lib/puzzleGenerator');
const { getFullEducationalContent, getIntroduction } = require('./lib/education');

const OUTPUT_DIR = path.join(process.cwd(), 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

program
  .name('privacypuzzle')
  .description('Educational tool for encryption and steganography integrated in digital puzzles')
  .version('1.0.0')
  .addHelpText('before', getIntroduction());

program
  .command('hide')
  .description('Hide a confidential message in a nonogram puzzle')
  .requiredOption('-m, --message <string>', 'Message to hide')
  .requiredOption('-p, --password <string>', 'Password for AES-256-GCM encryption')
  .option('-s, --size <number>', 'Grid size (width/height)', '15')
  .option('-c, --cell-size <number>', 'Cell size in pixels', '40')
  .option('-o, --output <filename>', 'Output filename (without extension)', 'puzzle')
  .action(async (options) => {
    try {
      console.log('Generating nonogram puzzle...');
      const size = parseInt(options.size, 10);
      if (isNaN(size) || size < 5 || size > 30) throw new Error('Size must be between 5 and 30.');

      const { rowHints, colHints } = generateNonogram(size, size, 0.45);
      console.log('Rendering puzzle image...');
      const puzzleImage = await renderNonogramPuzzle(rowHints, colHints, parseInt(options.cellSize, 10));

      console.log('Encrypting message with AES-256-GCM...');
      const encryptedMessage = encrypt(options.message, options.password);

      console.log('Hiding encrypted data using LSB steganography...');
      const stegoImage = await hideData(puzzleImage, encryptedMessage);

      const outputPath = path.join(OUTPUT_DIR, `${options.output}.png`);
      fs.writeFileSync(outputPath, stegoImage);

      console.log('\nPuzzle generated successfully!');
      console.log(`File saved at: ${outputPath}`);
      console.log('\nShare this image. The recipient must solve the nonogram');
      console.log('and use the "reveal" command with the same password to retrieve the message.');
    } catch (error) {
      console.error('\nError:', error.message);
      process.exit(1);
    }
  });

program
  .command('reveal')
  .description('Extract and decrypt a hidden message from a puzzle image')
  .requiredOption('-i, --input <path>', 'Path to PNG image with hidden data')
  .requiredOption('-p, --password <string>', 'Password used for encryption')
  .action(async (options) => {
    try {
      if (!fs.existsSync(options.input)) throw new Error('Image file does not exist.');

      const imageBuffer = fs.readFileSync(options.input);
      console.log('Extracting hidden data...');
      const extractedEncrypted = await extractData(imageBuffer);

      console.log('Decrypting message with AES-256-GCM...');
      const decryptedMessage = decrypt(extractedEncrypted, options.password);

      console.log('\nMessage retrieved successfully!\n');
      console.log('Confidential message:');
      console.log(`"${decryptedMessage}"`);
    } catch (error) {
      console.error('\nError:', error.message);
      if (error.message.includes('authentication') || error.message.includes('Password')) {
        console.error('Possible causes: incorrect password or corrupt/invalid image.');
      }
      process.exit(1);
    }
  });

program
  .command('educate')
  .description('Display educational content on privacy, cryptography, and steganography')
  .action(() => {
    console.log(getFullEducationalContent());
  });

program.on('--help', () => {
  console.log('\nUsage examples:');
  console.log('  privacypuzzle hide -m "Sensitive info" -p "StrongPassword123!"');
  console.log('  privacypuzzle reveal -i output/puzzle.png -p "StrongPassword123!"');
  console.log('  privacypuzzle educate');
});

program.parse(process.argv);
if (!process.argv.slice(2).length) program.outputHelp();
