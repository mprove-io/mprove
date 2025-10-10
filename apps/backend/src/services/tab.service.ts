import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
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
