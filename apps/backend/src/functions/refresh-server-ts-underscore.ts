import { isDefined } from '~common/functions/is-defined';

export function refreshServerTsUnderscore<T extends { server_ts: string }>(
  arr: T[],
  newServerTs: string
) {
  if (isDefined(arr)) {
    arr.forEach(element => (element.server_ts = newServerTs));
  }
}
