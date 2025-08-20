import { isDefined } from '~common/functions/is-defined';

export function refreshServerTs<T extends { serverTs: number }>(
  arr: T[],
  newServerTs: number
) {
  if (isDefined(arr)) {
    arr.forEach(element => (element.serverTs = newServerTs));
  }
}
