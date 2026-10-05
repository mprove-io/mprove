import { createHash } from 'node:crypto';
import { makeIdPrefix } from '#common/functions/make-id-prefix/make-id-prefix';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';

export function makeTestApiKey(item: {
  testId: string;
  userId?: string;
  sessionId?: string;
}) {
  let testPrefix = makeIdPrefix();
  let testSecret = createHash('sha256')
    .update(item.testId)
    .digest('hex')
    .toUpperCase(); // 64 chars instead of 32

  if (item.userId) {
    return `${'PK' satisfies ApiKeyType}-${testPrefix}-${item.userId}-${testSecret}`;
  } else if (item.sessionId) {
    return `${'SK' satisfies ApiKeyType}-${testPrefix}-${item.sessionId}-${testSecret}`;
  } else {
    return `unknown-key-for-${item.testId}`;
  }
}
