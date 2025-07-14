export function encodeFilePath(item: { filePath: string }): string {
  let { filePath } = item;

  let result = filePath.replace(/\./g, '_DOT_');

  return encodeURIComponent(result);
}
