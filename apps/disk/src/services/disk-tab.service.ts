import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import {
  decryptData,
  encryptData
} from '#node-common/functions/encrypt-decrypt';
import { DiskConfig } from '~disk/config/disk-config';

@Injectable()
export class DiskTabService {
  private keyBuffer: Buffer;

  constructor(private cs: ConfigService<DiskConfig>) {
    let keyBase64 = this.cs.get<DiskConfig['aesKey']>('aesKey');
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
