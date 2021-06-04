import { common } from '~front/barrels/common';

export function getFileExtension(value: string, short?: boolean) {
  if (common.isUndefined(value)) {
    return value;
  }

  const valueChunks: string[] = value.split('.');

  let ext = '.other';
  let letter = 't';

  if (valueChunks.length > 1) {
    ext = `.${valueChunks[valueChunks.length - 1]}`;

    switch (ext) {
      case common.FileExtensionEnum.View:
        letter = 'v';
        break;

      case common.FileExtensionEnum.Model:
        letter = 'm';
        break;

      case common.FileExtensionEnum.Dashboard:
        letter = 'd';
        break;

      case common.FileExtensionEnum.Viz:
        letter = 'z';
        break;

      case common.FileExtensionEnum.Udf:
        letter = 'u';
        break;

      case common.FileExtensionEnum.Conf:
        letter = 'c';
        break;

      case common.FileExtensionEnum.Md:
        letter = 't';
        break;
    }
  }

  return short === true ? letter : ext.substring(1);
}
