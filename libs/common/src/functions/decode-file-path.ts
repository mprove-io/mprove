export function decodeFilePath(item: { filePath: string }): string {
  let { filePath } = item;

  let result = decodeURIComponent(filePath);

  result = result.replace(/_DOT_/g, '.');

  return result;
}
