const generate = require('nanoid/generate');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function makeIdLetters() {
  return generate(alphabet, 20); // => "KEOHJKEIRFOEMGOWEKWR"
}
