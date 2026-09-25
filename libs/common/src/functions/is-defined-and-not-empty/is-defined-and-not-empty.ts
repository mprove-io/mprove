export function isDefinedAndNotEmpty(x: any) {
  return typeof x !== 'undefined' && x !== null && x !== '';
}
