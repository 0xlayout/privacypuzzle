const { encrypt, decrypt } = require('../lib/encryptation');
const crypto = require('node:crypto');

describe('AES-256-GCM Encryption Module – Advanced Security Tests', () => {
  const referenceMessage = 'Highly sensitive confidential message – Critical integrity – 27 December 2025';
  const strongPassword = 'VeryHighEntropy2025!@#NISTSP800-63BCompliantPassword';
  const weakPassword = '123456';

  test('maintains perfect confidentiality: ciphertext does not reveal plaintext', () => {
    const encrypted1 = encrypt(referenceMessage, strongPassword);
    const encrypted2 = encrypt('Completely different message of same length', strongPassword);

    const hammingDistance = Buffer.from(encrypted1).reduce((dist, byte, i) =>
      dist + (byte ^ encrypted2[i]).toString(2).split('1').length - 1, 0);

    const bitLength = encrypted1.length * 8;
    const distanceRatio = hammingDistance / bitLength;

    expect(distanceRatio).toBeGreaterThan(0.45);
    expect(distanceRatio).toBeLessThan(0.55);
  });

  test('ensures full non-determinism: no two executions produce identical ciphertext', () => {
    const ciphertexts = new Set();
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const encrypted = encrypt(referenceMessage, strongPassword);
      const hex = encrypted.toString('hex');
      expect(ciphertexts.has(hex)).toBe(false);
      ciphertexts.add(hex);
    }

    expect(ciphertexts.size).toBe(iterations);
  });

  test('detects any modification to ciphertext, tag, or parameters (authenticated integrity)', () => {
    const original = encrypt(referenceMessage, strongPassword);

    const modifications = [
      Buffer.from(original),
      Buffer.from(original),
      Buffer.from(original),
      Buffer.from(original)
    ];

    modifications[0][0] ^= 0x01;   // salt
    modifications[1][16] ^= 0x01;  // IV
    modifications[2][28] ^= 0x01;  // tag
    modifications[3][44] ^= 0x01;  // ciphertext

    modifications.forEach(tampered => {
      expect(() => decrypt(tampered, strongPassword)).toThrow();
    });
  });

  test('resists nonce reuse attacks by using unique random IVs', () => {
    const ivSet = new Set();
    const iterations = 200;

    for (let i = 0; i < iterations; i++) {
      const encrypted = encrypt(referenceMessage, strongPassword);
      const iv = encrypted.slice(16, 28);
      const ivHex = iv.toString('hex');
      expect(ivSet.has(ivHex)).toBe(false);
      ivSet.add(ivHex);
    }

    expect(ivSet.size).toBe(iterations);
  });

  test('applies brute-force resistant key derivation even with weak passwords', () => {
    const encrypted = encrypt(referenceMessage, weakPassword);
    const commonPasswords = ['password', '12345678', 'qwerty', 'letmein', 'admin123'];

    commonPasswords.forEach(pw => {
      expect(() => decrypt(encrypted, pw)).toThrow();
    });

    const start = process.hrtime.bigint();
    encrypt('test', weakPassword);
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    expect(durationMs).toBeGreaterThan(8);
  });

  test('handles extreme and non-standard message lengths correctly', () => {
    const extremeCases = [
      '',                     // empty
      'A',                    // 1 byte
      'A'.repeat(1023),       // just before block boundary
      'A'.repeat(1024 * 1024),// 1 MB
      crypto.randomBytes(10 * 1024 * 1024).toString('binary') // 10 MB random binary
    ];

    extremeCases.forEach(msg => {
      const encrypted = encrypt(msg, strongPassword);
      const decrypted = decrypt(encrypted, strongPassword);
      expect(decrypted).toBe(msg);
    });
  });
});