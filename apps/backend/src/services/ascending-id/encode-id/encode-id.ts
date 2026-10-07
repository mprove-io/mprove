import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';

const base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function encodeId(item: { encoded: bigint }): string {
  let { encoded } = item;

  let timeBytes: Buffer = Buffer.alloc(6);

  for (let i = 0; i < 6; i++) {
    timeBytes[i] = Number((encoded >> BigInt(40 - 8 * i)) & BigInt(0xff));
  }

  let random = '';

  let bytes: Buffer = randomBytes(14);

  for (let i = 0; i < 14; i++) {
    random += base62[bytes[i] % 62];
  }

  let result: string = timeBytes.toString('hex') + random;

  return result;
}
