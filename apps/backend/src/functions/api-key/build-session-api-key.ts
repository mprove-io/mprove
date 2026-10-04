export function buildSessionApiKey(item: {
  prefix: string;
  sessionId: string;
  secret: string;
}) {
  let { prefix, sessionId, secret } = item;

  return `SK-${prefix}-${sessionId.toUpperCase()}-${secret}`;
}
