import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { BackendConfig } from '#backend/config/backend-config';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { decryptData } from '#node-common/functions/decrypt-data/decrypt-data';
import { encryptData } from '#node-common/functions/encrypt-data/encrypt-data';

@Injectable()
export class TabService {
  readonly keyBuffer: Buffer;
  readonly keyTag: string;
  readonly prevKeyBuffer?: Buffer;
  readonly prevKeyTag?: string;

  constructor(private cs: ConfigService<BackendConfig>) {
    let keyBase64: string = this.cs.get<BackendConfig['aesKey']>('aesKey');

    let prevKeyBase64: string =
      this.cs.get<BackendConfig['prevAesKey']>('prevAesKey');

    this.keyBuffer = Buffer.from(keyBase64, 'base64');

    this.keyTag = this.cs.get<BackendConfig['aesKeyTag']>('aesKeyTag');

    this.prevKeyBuffer = isDefined(prevKeyBase64)
      ? Buffer.from(prevKeyBase64, 'base64')
      : undefined;

    this.prevKeyTag =
      this.cs.get<BackendConfig['prevAesKeyTag']>('prevAesKeyTag');
  }

  encrypt(item: { data: unknown }): string {
    let { data } = item;

    let encrypted: string = encryptData({
      data: data,
      keyBuffer: this.keyBuffer
    });

    return encrypted;
  }

  decrypt<T>(item: { encryptedString: string; keyBuffer: Buffer }): T {
    let { encryptedString, keyBuffer } = item;

    let decrypted: T = isDefinedAndNotEmpty(encryptedString)
      ? decryptData<T>({
          encryptedString: encryptedString,
          keyBuffer: keyBuffer
        })
      : ({} as T);

    return decrypted;
  }
}
