import { customAlphabet } from 'nanoid';
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function makeId() {
  let nanoid = customAlphabet(alphabet, 20); // => "SJ8JVTJWN2TWOY2T6ZJH"
  return nanoid();
}
