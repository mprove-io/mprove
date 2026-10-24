export function parseJwtClaims(item: { token: string }): any | undefined {
  let { token } = item;

  let parts: string[] = token.split('.');

  if (parts.length !== 3) {
    return undefined;
  }

  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  } catch {
    return undefined;
  }
}
