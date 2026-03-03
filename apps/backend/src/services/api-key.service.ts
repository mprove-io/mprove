import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { makeIdPrefix } from '#common/functions/make-id-prefix';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class ApiKeyService {
  constructor() {}

  async generateApiKeyParts() {
    let prefix = makeIdPrefix();

    let secret = crypto.randomBytes(16).toString('hex').toUpperCase();
    let salt = await bcrypt.genSalt();
    let secretHash = await bcrypt.hash(secret, salt);

    return { prefix, secret, secretHash, salt };
  }

  buildUserApiKey(item: {
    prefix: string;
    userId: string;
    secret: string;
  }): string {
    return `${ApiKeyTypeEnum.PK}-${item.prefix}-${item.userId}-${item.secret}`;
  }

  buildSessionApiKey(item: {
    prefix: string;
    sessionId: string;
    secret: string;
  }): string {
    return `${ApiKeyTypeEnum.SK}-${item.prefix}-${item.sessionId.toUpperCase()}-${item.secret}`;
  }

  async validateApiKeySecret(item: {
    secret: string;
    storedHash: string;
    salt: string;
  }): Promise<boolean> {
    let hash = await bcrypt.hash(item.secret, item.salt);
    return hash === item.storedHash;
  }

  parseApiKey(fullKey: string): {
    type: ApiKeyTypeEnum;
    prefix: string;
    entityId: string;
    secret: string;
  } {
    let parts = fullKey.split('-');

    if (parts.length !== 4) {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_API_KEY_FORMAT
      });
    }

    let type = parts[0] as ApiKeyTypeEnum;
    let prefix = parts[1];
    let entityId =
      type === ApiKeyTypeEnum.SK ? parts[2].toLowerCase() : parts[2];
    let secret = parts[3];

    return { type, prefix, entityId, secret };
  }
}
