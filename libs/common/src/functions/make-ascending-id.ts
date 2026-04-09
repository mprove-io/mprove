import { randomBytes } from 'node:crypto';

const base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const HEX_RE = /^[a-z]+_([0-9a-f]{12})/;

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

  return prefix + '_' + encodeId({ encoded: encoded });
}

export function makeAscendingIdAfter(item: {
  prefix: string;
  afterId: string;
}): string {
  let { prefix, afterId } = item;

  let match = HEX_RE.exec(afterId);
  if (!match) {
    return makeAscendingId({ prefix: prefix });
  }

  let afterEncoded = BigInt('0x' + match[1]);

  let now = Date.now();
  if (now !== lastTimestamp) {
    lastTimestamp = now;
    counter = 0;
  }
  counter++;

  let nowEncoded = BigInt(now) * BigInt(0x1000) + BigInt(counter);

  let chosen =
    afterEncoded >= nowEncoded ? afterEncoded + BigInt(1) : nowEncoded;

  // Advance module state so subsequent makeAscendingId calls remain strictly
  // greater than the chosen value, even if the wall clock hasn't caught up.
  lastTimestamp = Number(chosen / BigInt(0x1000));
  counter = Number(chosen % BigInt(0x1000));

  return prefix + '_' + encodeId({ encoded: chosen });
}

function encodeId(item: { encoded: bigint }): string {
  let { encoded } = item;

  let timeBytes = Buffer.alloc(6);
  for (let i = 0; i < 6; i++) {
    timeBytes[i] = Number((encoded >> BigInt(40 - 8 * i)) & BigInt(0xff));
  }

  let random = '';
  let bytes = randomBytes(14);
  for (let i = 0; i < 14; i++) {
    random += base62[bytes[i] % 62];
  }

  return timeBytes.toString('hex') + random;
}
