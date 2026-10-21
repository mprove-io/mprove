import * as crypto from 'node:crypto';

export function makePassPhrase(): string {
  let length = 32;

  let output = '';

  let charset: string =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let randomValues: Uint8Array = new Uint8Array(length);

  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    let randomIndex: number = randomValues[i] % charset.length;

    output += charset[randomIndex];
  }

  return output;
}
