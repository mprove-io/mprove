import { ServerError } from '#common/classes/server-error/server-error';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';

export function parseApiKey(item: { fullKey: string }) {
  let { fullKey } = item;

  let parts = fullKey.split('-');

  if (parts.length !== 4) {
    throw new ServerError({
      message: 'BACKEND_WRONG_API_KEY_FORMAT'
    });
  }

  let type = parts[0] as ApiKeyType;

  let prefix = parts[1];

  let entityId = type === 'SK' ? parts[2].toLowerCase() : parts[2];

  let secret = parts[3];

  return { type: type, prefix: prefix, entityId: entityId, secret: secret };
}
