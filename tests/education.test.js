const {
  getIntroduction,
  getSteganographyRisks,
  getPasswordBestPractices,
  getPrivacyPrinciples,
  getFullEducationalContent
} = require('../lib/education');

describe('Educational Module – Professional Content', () => {
  test('content includes references to recognized international standards', () => {
    const full = getFullEducationalContent();

    expect(full).toMatch(/NIST/);
    expect(full).toMatch(/AES-256-GCM/);
    expect(full).toMatch(/PBKDF2/);
    expect(full).toMatch(/ISO\/IEC 27001/);
    expect(full).toMatch(/GDPR/);
    expect(full).toMatch(/Kerckhoffs/);
  });

  test('each section has adequate length and professional structure', () => {
    expect(getIntroduction().length).toBeGreaterThan(500);
    expect(getSteganographyRisks().length).toBeGreaterThan(600);
    expect(getPasswordBestPractices().length).toBeGreaterThan(500);
    expect(getPrivacyPrinciples().length).toBeGreaterThan(400);
  });

  test('does not contain informal language or placeholders', () => {
    const full = getFullEducationalContent();
    const informalPatterns = /\b(wow|cool|super|easy|just|simply)\b/i;
    expect(full).not.toMatch(informalPatterns);
  });
});
