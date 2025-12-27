function getIntroduction() {
  return `
PrivacyPuzzle: Educational tool for protecting confidential information
using authenticated cryptography and integrated steganography in digital puzzles.

This project demonstrates practical applications of modern information security
techniques to safeguard sensitive data, combining:

• Authenticated symmetric cryptography AES-256-GCM with PBKDF2 key derivation
  and unique per-message parameters.
• Multibit LSB steganography in procedurally generated PNG images with high
  visual entropy, minimizing detectable artifacts.
• Gamified elements (procedural nonograms) that encourage active interaction
  to access protected content.

The design promotes understanding of defense-in-depth and responsible human
participation in security processes.
`.trim();
}

function getSteganographyRisks() {
  return `
Limitations and risks of LSB steganography

While multibit LSB hiding in high-entropy images offers plausible deniability
against casual inspection, it does not withstand advanced steganalysis:

• First- and higher-order statistical analysis (χ², RS analysis, Sample Pair).
• Detection using trained neural networks (YeNet, XuNet).
• Histogram and frequency-domain noise analysis.

Best practice recommendations:
• Use steganography only as a complement to strong cryptography.
• Avoid carriers with low entropy or known patterns.
• Consider operational context: EXIF metadata, distribution channels,
  and adversary profiling.
• Follow Kerckhoffs' principle: security resides in the key, not in the
  secrecy of the method.

Steganography provides operational hiding, not cryptographic confidentiality.
`.trim();
}

function getPasswordBestPractices() {
  return `
Secure password and key management (NIST SP 800-63B)

Password strength directly affects scheme security:

Recommended requirements (AAL3 level):
• Minimum length: 16 characters
• Entropy ≥ 64 bits (preferably ≥ 80 bits)
• Diverse composition: uppercase, lowercase, digits, non-alphanumeric symbols
• Avoid predictable patterns, dictionary words, or personal information

Implementation in PrivacyPuzzle:
• PBKDF2-HMAC-SHA256 with 100,000 iterations (adjustable per NIST 2024)
• 128-bit CSPRNG salt
• Protection against timing and side-channel attacks in Node.js

Complement with FIPS 140-3 approved password managers and MFA when applicable.
`.trim();
}

function getPrivacyPrinciples() {
  return `
Information security and privacy by design principles

1. Confidentiality and integrity using proven authenticated cryptography.
2. Defense-in-depth: multiple independent barriers (encryption + hiding).
3. Data minimization and need-to-know principle (GDPR Art. 5, ISO/IEC 27001).
4. Transparency and auditability: open source, complete documentation, testing.
5. Shared responsibility: robust tools require competent use.
6. Resilience against adversaries with varying capabilities (explicit threat model).
7. Continuous education as a pillar of sustainable cybersecurity.

PrivacyPuzzle serves as an advanced educational resource for professionals,
students, and researchers in cybersecurity and data protection.
`.trim();
}

function getFullEducationalContent() {
  return [
    getIntroduction(),
    getSteganographyRisks(),
    getPasswordBestPractices(),
    getPrivacyPrinciples(),
    `\n© PrivacyPuzzle – Open-source educational project promoting responsible digital privacy.`
  ].join('\n\n');
}

module.exports = {
  getIntroduction,
  getSteganographyRisks,
  getPasswordBestPractices,
  getPrivacyPrinciples,
  getFullEducationalContent
};
