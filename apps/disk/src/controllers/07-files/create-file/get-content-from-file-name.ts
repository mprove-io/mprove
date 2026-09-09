import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { MyRegex } from '#common/models/my-regex';

export function getContentFromFileName(item: { fileName: string }): string {
  let { fileName } = item;

  let content: string;

  let fileNameLowercase: string = fileName.toLowerCase();

  let part: string = MyRegex.CAPTURE_FILE_NAME_BEFORE_EXT().exec(
    fileNameLowercase
  )?.[1] as string;

  let ext: string = MyRegex.CAPTURE_EXT().exec(fileNameLowercase)?.[1] ?? '';

  switch (ext) {
    case FileExtensionEnum.Store:
      content = `store: ${part}`;
      break;
    case FileExtensionEnum.Schema:
      content = `schema: ${part}`;
      break;
    case FileExtensionEnum.Dashboard:
      content = `dashboard: ${part}`;
      break;
    case FileExtensionEnum.Chart:
      content = `chart: ${part}`;
      break;
    case FileExtensionEnum.Report:
      content = `report: ${part}`;
      break;
    case FileExtensionEnum.Space:
      content = `space: ${part}`;
      break;
    case FileExtensionEnum.Yml:
      content = fileName === MPROVE_CONFIG_FILENAME ? 'mprove_dir: ./' : '';
      break;
    case FileExtensionEnum.Md:
      content = '';
      break;
    default:
      content = '';
  }

  return content;
}
