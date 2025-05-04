const { createCipheriv, createDecipheriv, randomBytes } = require("crypto")

const encryptionKey = process.env.ENCRYPTION_SECRET_KEY

// Use your securely generated 32-byte secret key
const secretKey = Buffer.from(encryptionKey, 'hex');

// Function to encrypt a text
const encryptText = (text) => {
    const iv = randomBytes(16); // Generate a random IV
    const cipher = createCipheriv('aes-256-cbc', secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Return IV along with encrypted text
};

// Function to decrypt a text
const decryptText = (encryptedText) => {
    const textParts = encryptedText.split(':');
    const ivHex = textParts.shift();
    if (!ivHex || ivHex.length !== 32) { // 32 hex characters = 16 bytes
        throw new Error('Invalid IV length. Expected 32 hex characters.');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedTextHex = textParts.join(':');
    const decipher = createDecipheriv('aes-256-cbc', secretKey, iv);
    let decrypted = decipher.update(encryptedTextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

module.exports = {
    encryptText,
    decryptText
}