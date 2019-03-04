export function undefinedToNull(value: any) {

  return typeof value !== 'undefined' ? value : null;
}
