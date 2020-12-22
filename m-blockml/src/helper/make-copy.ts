export function makeCopy<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}
