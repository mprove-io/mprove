import { DOT_SYMBOL } from '#common/constants/top';

export function encodeFilePath(item: { filePath: string }): string {
  let { filePath } = item;

  let result = filePath.replace(/\./g, DOT_SYMBOL);

  return encodeURIComponent(result);
}
