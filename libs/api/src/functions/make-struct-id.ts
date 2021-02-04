const generate = require('nanoid/generate');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function makeStructId() {
  return generate(alphabet, 10); // => "EHQNBXYDTL"
}
