export function buildUserApiKey(item: {
  prefix: string;
  userId: string;
  secret: string;
}) {
  let { prefix, userId, secret } = item;

  return `PK-${prefix}-${userId}-${secret}`;
}
