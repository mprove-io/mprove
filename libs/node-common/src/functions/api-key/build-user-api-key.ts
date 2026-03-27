import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';

export function buildUserApiKey(item: {
  prefix: string;
  userId: string;
  secret: string;
}) {
  let { prefix, userId, secret } = item;

  return `${ApiKeyTypeEnum.PK}-${prefix}-${userId}-${secret}`;
}
