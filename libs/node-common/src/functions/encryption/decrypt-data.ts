import * as crypto from 'crypto';

export function decryptData<T>(item: {
  encryptedString: string;
  keyBase64: string;
}): T {
  let { encryptedString, keyBase64 } = item;

  let key = Buffer.from(keyBase64, 'base64');

  let parts = encryptedString.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted string format');
  }

  let [ivHex, authTagHex, encryptedHex] = parts;

  let iv = Buffer.from(ivHex, 'hex');

  let authTag = Buffer.from(authTagHex, 'hex');

  let decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');

  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}
