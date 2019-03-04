export function isNotNullAndNotEmpty(x: any) {
  return typeof x !== 'undefined' && x !== null && x !== '';
}
