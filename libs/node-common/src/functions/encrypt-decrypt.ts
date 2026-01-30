import * as crypto from 'crypto';

export function encryptData(item: { data: any; keyBuffer: Buffer }) {
  let { data, keyBuffer } = item;

  let iv = crypto.randomBytes(16);

  let cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

  let jsonString = JSON.stringify(data);

  let encryptedHex =
    cipher.update(jsonString, 'utf8', 'hex') + cipher.final('hex');

  let authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedHex}`;
}

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
