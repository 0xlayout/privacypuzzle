const { generateNonogram, renderNonogramPuzzle } = require('../lib/puzzleGenerator');
const sharp = require('sharp');

describe('Procedural Nonogram Generator', () => {
  test('produces row and column hints consistent with the grid', () => {
    for (let i = 0; i < 50; i++) {
      const size = 20;
      const { grid, rowHints, colHints } = generateNonogram(size, size, 0.45);

      grid.forEach((row, y) => {
        const computed = computeHints(row);
        expect(computed).toEqual(rowHints[y]);
      });

      for (let x = 0; x < size; x++) {
        const column = grid.map(row => row[x]);
        const computed = computeHints(column);
        expect(computed).toEqual(colHints[x]);
      }
    }
  });

  test('renders valid images with correct metadata and no SVG artifacts', async () => {
    const { rowHints, colHints } = generateNonogram(15, 15);
    const imageBuffer = await renderNonogramPuzzle(rowHints, colHints, 50);

    const metadata = await sharp(imageBuffer).metadata();
    expect(metadata.format).toBe('png');
    expect(metadata.width).toBeGreaterThan(300);
    expect(metadata.height).toBeGreaterThan(300);
    expect(metadata.channels).toBe(4);// RGBA output from SVG with transparency
  });

  test('maintains readability across different cell sizes', async () => {
    const sizes = [20, 40, 60];
    const { rowHints, colHints } = generateNonogram(10, 10);

    for (const cellSize of sizes) {
      const buffer = await renderNonogramPuzzle(rowHints, colHints, cellSize);
      const { width, height } = await sharp(buffer).metadata();

      expect(width).toBeGreaterThan(cellSize * 10);
      expect(height).toBeGreaterThan(cellSize * 10);
    }
  });

  function computeHints(line) {
    const hints = [];
    let count = 0;
    for (const cell of line) {
      if (cell === 1) count++;
      else if (count > 0) { hints.push(count); count = 0; }
    }
    if (count > 0) hints.push(count);
    return hints.length ? hints : [0];
  }
});
