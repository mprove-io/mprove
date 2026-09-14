import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';

export function parseApiKey(item: { fullKey: string }) {
  let { fullKey } = item;

  let parts = fullKey.split('-');

  if (parts.length !== 4) {
    throw new ServerError({
      message: ErEnum.BACKEND_WRONG_API_KEY_FORMAT
    });
  }

  let type = parts[0] as ApiKeyTypeEnum;

  let prefix = parts[1];

  let entityId = type === ApiKeyTypeEnum.SK ? parts[2].toLowerCase() : parts[2];

  let secret = parts[3];

  return { type: type, prefix: prefix, entityId: entityId, secret: secret };
}
