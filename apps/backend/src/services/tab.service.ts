import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { GIT_KEY_PASS_PHRASE } from '~common/constants/top';
import { BoolEnum } from '~common/enums/bool.enum';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import {
  decryptData,
  encryptData
} from '~node-common/functions/encrypt-decrypt';

@Injectable()
export class TabService {
  private keyBuffer: Buffer;
  private isEncryption: boolean;

  constructor(private cs: ConfigService<BackendConfig>) {
    let keyBase64 = this.cs.get<BackendConfig['aesKey']>('aesKey');
    this.keyBuffer = Buffer.from(keyBase64, 'base64');

    this.isEncryption =
      this.cs.get<BackendConfig['isDbEncryptionEnabled']>(
        'isDbEncryptionEnabled'
      ) === BoolEnum.TRUE;
  }

  getTabProps<ST, LT>(item: {
    ent: {
      st: { encrypted: string; decrypted: ST };
      lt: { encrypted: string; decrypted: LT };
    };
    keyBuffer?: Buffer<ArrayBufferLike>;
  }) {
    let { ent, keyBuffer } = item;

    return this.isEncryption === true
      ? {
          ...this.decrypt<ST>({
            encryptedString: ent.st.encrypted,
            keyBuffer: keyBuffer ?? this.keyBuffer
          }),
          ...this.decrypt<LT>({
            encryptedString: ent.lt.encrypted,
            keyBuffer: keyBuffer ?? this.keyBuffer
          })
        }
      : {
          ...ent.st.decrypted,
          ...ent.lt.decrypted
        };
  }

  getEntProps<DataSt, DataLt>(item: { dataSt: DataSt; dataLt: DataLt }) {
    let { dataSt, dataLt } = item;

    return this.isEncryption === true
      ? {
          st: {
            encrypted: this.encrypt({ data: dataSt }),
            decrypted: undefined as DataSt
          },
          lt: {
            encrypted: this.encrypt({ data: dataLt }),
            decrypted: undefined as DataLt
          }
        }
      : {
          st: {
            encrypted: undefined as string,
            decrypted: dataSt
          },
          lt: {
            encrypted: undefined as string,
            decrypted: dataLt
          }
        };
  }

  encrypt(item: { data: any }) {
    let { data } = item;

    return encryptData({
      data: data,
      keyBuffer: this.keyBuffer
    });
  }

  decrypt<T>(item: {
    encryptedString: string;
    keyBuffer: Buffer<ArrayBufferLike>;
  }): T {
    let { encryptedString, keyBuffer } = item;

    return isDefinedAndNotEmpty(encryptedString)
      ? decryptData({
          encryptedString: item.encryptedString,
          keyBuffer: keyBuffer
        })
      : ({} as T);
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
}
