import * as crypto from 'crypto';

export function encryptData(item: {
  data: any;
  keyBuffer: Buffer;
}) {
  let { data, keyBuffer } = item;

  let iv = crypto.randomBytes(16);

  let cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

  let jsonString = JSON.stringify(data);

  let encryptedHex =
    cipher.update(jsonString, 'utf8', 'hex') + cipher.final('hex');

  let authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedHex}`;
}
