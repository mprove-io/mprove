import * as crypto from 'crypto';

export function encryptData(item: {
  data: any;
  keyBase64: string;
}) {
  let { data, keyBase64 } = item;

  let key = Buffer.from(keyBase64, 'base64');

  let iv = crypto.randomBytes(16);

  let cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let jsonString = JSON.stringify(data);

  let encryptedHex = cipher.update(jsonString, 'utf8', 'hex');

  encryptedHex += cipher.final('hex');

  let authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedHex}`;
}
