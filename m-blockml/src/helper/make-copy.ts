export function makeCopy(x: any) {
  return JSON.parse(JSON.stringify(x));
}
