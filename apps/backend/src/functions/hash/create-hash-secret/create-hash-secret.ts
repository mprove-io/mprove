import * as crypto from 'node:crypto';

export function createHashSecret(): string {
  let hashSecret: string = crypto.randomBytes(32).toString('hex');

  return hashSecret;
}
