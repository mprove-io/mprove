import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';

@Injectable()
export class TabService {
  private keyBase64: string;

  constructor(private cs: ConfigService<BackendConfig>) {
    this.keyBase64 =
      this.cs.get<BackendConfig['backendAesKey']>('backendAesKey');
  }

  encryptData(item: {
    data: any;
  }) {
    let { data } = item;

    let key = Buffer.from(this.keyBase64, 'base64');

    let iv = crypto.randomBytes(16);

    let cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let jsonString = JSON.stringify(data);

    let encryptedHex = cipher.update(jsonString, 'utf8', 'hex');

    encryptedHex += cipher.final('hex');

    let authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedHex}`;
  }

  decryptData<T>(item: {
    encryptedString: string;
  }): T {
    let { encryptedString } = item;

    let key = Buffer.from(this.keyBase64, 'base64');

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
}
