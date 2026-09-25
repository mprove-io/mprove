import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const alphabetWithNumbers = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function makeIdPrefix() {
  let a = customAlphabet(alphabet, 1);
  let b = customAlphabet(alphabetWithNumbers, 11);
  let id = a() + b();
  return id;
}
