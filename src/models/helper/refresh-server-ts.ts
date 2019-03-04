export function refreshServerTs(arr: any[], newServerTs: string) {
  return arr.map(element => Object.assign(element, { server_ts: newServerTs }));
}
