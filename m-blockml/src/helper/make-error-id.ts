const generate = require('nanoid/generate');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function makeErrorId() {
  return generate(alphabet, 20); // => "SJ8JVTJWN2TWOY2T6ZJH"
}
