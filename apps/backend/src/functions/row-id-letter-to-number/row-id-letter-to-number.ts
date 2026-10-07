import { ROW_ID_ALPHABET } from '#common/constants/top';

let alphabet = ROW_ID_ALPHABET;
let base = alphabet.length;

export function rowIdLetterToNumber(l: string) {
  let nums: number[] = [];

  [...l].forEach((x, i) => {
    let mult = l.length - 1 - i;

    let pos = [...alphabet].indexOf(x) + 1;

    let n = pos * Math.pow(base, mult);

    nums.push(n);
  });

  let num = nums.reduce((total, x) => total + x) - 1;

  return num;
}
