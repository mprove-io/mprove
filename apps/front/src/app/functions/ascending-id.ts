const prefixes = {
  message: 'msg',
  part: 'prt'
} as const;

type Prefix = keyof typeof prefixes;

const ID_LENGTH = 26;
let lastTimestamp = 0;
let counter = 0;

export function ascendingId(item: { prefix: Prefix }): string {
  let { prefix } = item;

  let currentTimestamp = Date.now();

  if (currentTimestamp !== lastTimestamp) {
    lastTimestamp = currentTimestamp;
    counter = 0;
  }

  counter += 1;

  let now = BigInt(currentTimestamp) * BigInt(0x1000) + BigInt(counter);

  let timeBytes = new Uint8Array(6);
  for (let i = 0; i < 6; i += 1) {
    timeBytes[i] = Number((now >> BigInt(40 - 8 * i)) & BigInt(0xff));
  }

  return (
    prefixes[prefix] +
    '_' +
    bytesToHex(timeBytes) +
    randomBase62(ID_LENGTH - 12)
  );
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function randomBase62(length: number): string {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let bytes = getRandomBytes(length);
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars[bytes[i] % 62];
  }
  return result;
}

function getRandomBytes(length: number): Uint8Array {
  let bytes = new Uint8Array(length);
  let cryptoObj =
    typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    cryptoObj.getRandomValues(bytes);
    return bytes;
  }

  for (let i = 0; i < length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }

  return bytes;
}
