import { ROW_ID_ALPHABET } from '#common/constants/top';

let alphabet = ROW_ID_ALPHABET;

let base = alphabet.length;

export function reportRowIdLetterToNumber(item: { rowId: string }): number {
  let { rowId: l } = item;

  let nums: number[] = [];

  [...l].forEach((x, i) => {
    let mult = l.length - 1 - i;

    let pos: number = [...alphabet].indexOf(x) + 1;

    let n: number = pos * Math.pow(base, mult);

    nums.push(n);
  });

  let num: number = nums.reduce((total, x) => total + x) - 1;

  return num;
}
