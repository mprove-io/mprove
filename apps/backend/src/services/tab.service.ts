import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isUndefined } from 'cypress/types/lodash';
import { BackendConfig } from '~backend/config/backend-config';
import { GIT_KEY_PASS_PHRASE } from '~common/constants/top';
import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { ServerError } from '~common/models/server-error';
import {
  decryptData,
  encryptData
} from '~node-common/functions/encrypt-decrypt';

@Injectable()
export class TabService {
  private keyBuffer: Buffer;
  private prevKeyBuffer: Buffer;

  private keyTag: string;
  private prevKeyTag: string;

  private isEncryption: boolean;

  constructor(private cs: ConfigService<BackendConfig>) {
    let keyBase64 = this.cs.get<BackendConfig['aesKey']>('aesKey');
    this.keyBuffer = Buffer.from(keyBase64, 'base64');

    let prevKeyBase64 = this.cs.get<BackendConfig['prevAesKey']>('prevAesKey');
    this.prevKeyBuffer = Buffer.from(prevKeyBase64, 'base64');

    this.isEncryption =
      this.cs.get<BackendConfig['isDbEncryptionEnabled']>(
        'isDbEncryptionEnabled'
      ) === BoolEnum.TRUE;
  }

  getTabProps<ST, LT>(item: {
    ent: {
      st: { encrypted: string; decrypted: ST };
      lt: { encrypted: string; decrypted: LT };
      keyTag: string;
    };
  }) {
    let { ent } = item;

    if (
      (isUndefined(ent.st.encrypted) || isUndefined(ent.lt.encrypted)) &&
      (isUndefined(ent.st.decrypted) || isUndefined(ent.lt.decrypted))
    ) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORD_HAS_NO_DECRYPTED_AND_NO_ENCRYPTED_PROPS,
        customData: ent
      });
    }

    if (
      (isDefined(ent.st.encrypted) || isDefined(ent.lt.encrypted)) &&
      (isDefined(ent.st.decrypted) || isDefined(ent.lt.decrypted))
    ) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORD_HAS_BOTH_DECRYPTED_AND_ENCRYPTED_PROPS,
        customData: ent
      });
    }

    if (
      isUndefined(ent.keyTag) &&
      (isDefined(ent.st.decrypted) || isDefined(ent.lt.decrypted))
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_DB_RECORD_IS_DECRYPTED_BUT_HAS_KEY_TAG,
        customData: ent
      });
    }

    if (
      isDefined(ent.keyTag) &&
      [this.keyTag, this.prevKeyTag].indexOf(ent.keyTag) < 0
    ) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORD_KEY_TAG_DOES_NOT_MATCH_CURRENT_OR_PREV,
        customData: ent
      });
    }

    let keyBuffer =
      ent.keyTag === this.keyTag
        ? this.keyBuffer
        : ent.keyTag === this.prevKeyTag
          ? this.prevKeyBuffer
          : undefined;

    return isDefined(ent.keyTag)
      ? {
          ...this.decrypt<ST>({
            encryptedString: ent.st.encrypted,
            keyBuffer: keyBuffer
          }),
          ...this.decrypt<LT>({
            encryptedString: ent.lt.encrypted,
            keyBuffer: keyBuffer
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
          },
          keyTag: this.keyTag
        }
      : {
          st: {
            encrypted: undefined as string,
            decrypted: dataSt
          },
          lt: {
            encrypted: undefined as string,
            decrypted: dataLt
          },
          keyTag: undefined
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
