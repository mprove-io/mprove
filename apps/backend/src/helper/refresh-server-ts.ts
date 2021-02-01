export function refreshServerTs<T extends { server_ts: string }>(
  arr: T[],
  newServerTs: string
) {
  arr.forEach(element => (element.server_ts = newServerTs));
}
