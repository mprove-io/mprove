import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';

export function buildSessionApiKey(item: {
  prefix: string;
  sessionId: string;
  secret: string;
}) {
  let { prefix, sessionId, secret } = item;

  return `${ApiKeyTypeEnum.SK}-${prefix}-${sessionId.toUpperCase()}-${secret}`;
}
