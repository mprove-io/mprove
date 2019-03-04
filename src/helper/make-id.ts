const generate = require('nanoid/generate');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function makeId() {

  return generate(alphabet, 12); // => "V6GE1302MO58"
}