import { customAlphabet } from 'nanoid';

const alphanumeric = '0123456789abcdefghijklmnopqrstuvwxyz';

export function makeSessionId() {
  return 's' + customAlphabet(alphanumeric, 11)();
}
