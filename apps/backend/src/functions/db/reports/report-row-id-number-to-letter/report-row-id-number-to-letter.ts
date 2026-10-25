import { ROW_ID_ALPHABET } from '#common/constants/top';

let alphabet = ROW_ID_ALPHABET;

let base = alphabet.length;

export function reportRowIdNumberToLetter(item: {
  rowIdNumber: number;
}): string {
  let { rowIdNumber: n } = item;

  let digits: number[] = [];

  do {
    let v = n % base;

    digits.push(v);

    n = Math.floor(n / base);
  } while (n-- > 0);

  let chars: string[] = [];

  while (digits.length) {
    chars.push(alphabet[digits.pop()]);
  }

  let rowId: string = chars.join('');

  return rowId;
}
