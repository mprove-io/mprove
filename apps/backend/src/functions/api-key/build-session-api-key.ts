import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';

export function buildSessionApiKey(item: {
  prefix: string;
  sessionId: string;
  secret: string;
}) {
  let { prefix, sessionId, secret } = item;

  return `${'SK' satisfies ApiKeyType}-${prefix}-${sessionId.toUpperCase()}-${secret}`;
}
