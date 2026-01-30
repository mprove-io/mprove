import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const alphabetWithNumbers = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function makeId() {
  let a = customAlphabet(alphabet, 1); // => "S"
  let b = customAlphabet(alphabetWithNumbers, 19); // => "8JVTJWN2TWOY2T6ZJHJ"
  let id = a() + b(); // => "S8JVTJWN2TWOY2T6ZJHJ"
  return id;
}
