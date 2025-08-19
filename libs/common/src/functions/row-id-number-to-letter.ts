import { ROW_ID_ALPHABET } from '~common/constants/top';

let alphabet = ROW_ID_ALPHABET;
let base = alphabet.length;

export function rowIdNumberToLetter(n: number) {
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
