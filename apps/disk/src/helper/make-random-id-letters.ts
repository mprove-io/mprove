const generate = require('nanoid/generate');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function makeRandomIdLetters() {
  return generate(alphabet, 20); // => "SDIFKELSLYEWTERTHVXP"
}
