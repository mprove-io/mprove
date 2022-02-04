import { common } from '~backend/barrels/common';

export function refreshServerTs<T extends { server_ts: string }>(
  arr: T[],
  newServerTs: string
) {
  if (common.isDefined(arr)) {
    arr.forEach(element => (element.server_ts = newServerTs));
  }
}
