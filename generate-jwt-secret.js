const crypto = require('crypto');

// Generate a random 32-byte (256-bit) hex string
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT Secret:', jwtSecret);