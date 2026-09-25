// packages/malloy-filter/src/clause_utils.ts

export function malloyEscape(item: { str: string }): string {
  let { str } = item;

  let lstr: string = str.toLowerCase();

  if (lstr === 'null' || lstr === 'empty') {
    let escaped: string = '\\' + str;

    return escaped;
  }

  let escaped: string = str.replace(/([,; |()\\%_-])/g, '\\$1');

  return escaped;
}
