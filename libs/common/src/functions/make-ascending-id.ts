import { randomBytes } from 'node:crypto';

const base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

let lastTimestamp = 0;
let counter = 0;

export function makeAscendingId(item: { prefix: string }): string {
  let { prefix } = item;

  let now = Date.now();
  if (now !== lastTimestamp) {
    lastTimestamp = now;
    counter = 0;
  }
  counter++;

  let encoded = BigInt(now) * BigInt(0x1000) + BigInt(counter);
  let timeBytes = Buffer.alloc(6);
  for (let i = 0; i < 6; i++) {
    timeBytes[i] = Number((encoded >> BigInt(40 - 8 * i)) & BigInt(0xff));
  }

  let random = '';
  let bytes = randomBytes(14);
  for (let i = 0; i < 14; i++) {
    random += base62[bytes[i] % 62];
  }

  return prefix + '_' + timeBytes.toString('hex') + random;
}
