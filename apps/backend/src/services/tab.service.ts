import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { GIT_KEY_PASS_PHRASE } from '~common/constants/top';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import {
  decryptData,
  encryptData
} from '~node-common/functions/encrypt-decrypt';

@Injectable()
export class TabService {
  private keyBuffer: Buffer;

  constructor(private cs: ConfigService<BackendConfig>) {
    let keyBase64 = this.cs.get<BackendConfig['aesKey']>('aesKey');
    this.keyBuffer = Buffer.from(keyBase64, 'base64');
  }

  createGitKeyPair() {
    let { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: GIT_KEY_PASS_PHRASE
      }
    });

    return { publicKey, privateKey };
  }

  encrypt(item: { data: any }) {
    return encryptData({
      data: item.data,
      keyBuffer: this.keyBuffer
    });
  }

  decrypt<T>(item: { encryptedString: string }): T {
    let { encryptedString } = item;

    return isDefinedAndNotEmpty(encryptedString)
      ? decryptData({
          encryptedString: item.encryptedString,
          keyBuffer: this.keyBuffer
        })
      : ({} as T);
  }
}
