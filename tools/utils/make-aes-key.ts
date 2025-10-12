import * as crypto from 'crypto';

try {
  let aes256Key = crypto.randomBytes(32);

  let aes256Base64Key = aes256Key.toString('base64');

  console.log(`"${aes256Base64Key}"`);
} catch (e) {
  console.error('Unexpected error:', e);
  process.exit(1);
}
