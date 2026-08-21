type IsEqual<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2
    ? true
    : false;

export function assertTypesEqual<TLeft, TRight>(item: {
  value: IsEqual<TLeft, TRight> extends true
    ? true
    : 'ERROR: Types are not exactly equal';
}) {
  let { value } = item;
  return value;
}
