import { common } from '~front/barrels/common';

export function getFileExtension(value: string) {
  if (common.isUndefined(value)) {
    return value;
  }

  const valueChunks: string[] = value.split('.');

  let ext = '.other';

  if (valueChunks.length > 1) {
    ext = `.${valueChunks[valueChunks.length - 1]}`;
  }

  return ext.substring(1);
}
