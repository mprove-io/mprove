import { isUndefined } from './is-undefined';

export function transformErrorMessage(x: string) {
  if (isUndefined(x)) {
    return x;
  }

  let ar = x.split('_');
  if (ar[0] === 'BACKEND') {
    ar.shift();
  }

  return ar.join(' ');
}
