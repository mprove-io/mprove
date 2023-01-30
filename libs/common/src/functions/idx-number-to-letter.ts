import { constants } from '~common/barrels/constants';

let alphabet = constants.IDX_ALPHABET;
let base = alphabet.length;

export function idxNumberToLetter(n: number) {
  let digits = [];

  do {
    let v = n % base;

    digits.push(v);

    n = Math.floor(n / base);
  } while (n-- > 0);

  let chars = [];

  while (digits.length) {
    chars.push(alphabet[digits.pop()]);
  }

  return chars.join('');
}
