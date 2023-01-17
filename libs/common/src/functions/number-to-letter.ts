// https://github.com/matthewmueller/number-to-letter/blob/master/index.js

let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let base = alphabet.length;

export function numToLetter(n: number) {
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
