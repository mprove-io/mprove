// packages/malloy-filter/src/clause_utils.ts

export function malloyUnescape(item: { str: string }): string {
  let { str } = item;

  let unescaped: string = str.replace(/\\(.)/g, '$1');

  return unescaped;
}
