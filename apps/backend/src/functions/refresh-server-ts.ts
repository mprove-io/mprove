import { common } from '~backend/barrels/common';

export function refreshServerTs<T extends { serverTs: number }>(
  arr: T[],
  newServerTs: number
) {
  if (common.isDefined(arr)) {
    arr.forEach(element => (element.serverTs = newServerTs));
  }
}
