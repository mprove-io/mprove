import * as crypto from 'crypto';

export function decryptData<T>(item: {
  encryptedString: string;
  keyBuffer: Buffer;
}): T {
  let { encryptedString, keyBuffer } = item;

  let parts = encryptedString.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted string format');
  }

  let [ivHex, authTagHex, encryptedHex] = parts;

  let iv = Buffer.from(ivHex, 'hex');

  let authTag = Buffer.from(authTagHex, 'hex');

  let decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);

  decipher.setAuthTag(authTag);

  let decrypted =
    decipher.update(encryptedHex, 'hex', 'utf8') + decipher.final('utf8');

  return JSON.parse(decrypted);
}
