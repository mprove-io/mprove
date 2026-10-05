import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';

export function buildUserApiKey(item: {
  prefix: string;
  userId: string;
  secret: string;
}) {
  let { prefix, userId, secret } = item;

  return `${'PK' satisfies ApiKeyType}-${prefix}-${userId}-${secret}`;
}
