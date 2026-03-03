import { createHash } from 'node:crypto';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { makeIdPrefix } from '#common/functions/make-id-prefix';

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
    return `${ApiKeyTypeEnum.PK}-${testPrefix}-${item.userId}-${testSecret}`;
  } else if (item.sessionId) {
    return `${ApiKeyTypeEnum.SK}-${testPrefix}-${item.sessionId}-${testSecret}`;
  } else {
    return `unknown-key-for-${item.testId}`;
  }
}
