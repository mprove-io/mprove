import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { decryptData } from '~node-common/functions/tab/decrypt-data';
import { encryptData } from '~node-common/functions/tab/encrypt-data';

@Injectable()
export class TabService {
  private keyBase64: string;

  constructor(private cs: ConfigService<BackendConfig>) {
    this.keyBase64 = this.cs.get<BackendConfig['aesKey']>('aesKey');
  }

  encrypt(item: { data: any }) {
    return encryptData({
      data: item.data,
      keyBase64: this.keyBase64
    });
  }

  decrypt<T>(item: { encryptedString: string }): T {
    let { encryptedString } = item;

    return isDefinedAndNotEmpty(encryptedString)
      ? decryptData({
          encryptedString: item.encryptedString,
          keyBase64: this.keyBase64
        })
      : ({} as T);
  }
}
