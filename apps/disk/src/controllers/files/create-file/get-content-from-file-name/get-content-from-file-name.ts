import { MyRegex } from '#common/classes/my-regex/my-regex';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';

export function getContentFromFileName(item: { fileName: string }): string {
  let { fileName } = item;

  let content: string;

  let fileNameLowercase: string = fileName.toLowerCase();

  let part: string = MyRegex.CAPTURE_FILE_NAME_BEFORE_EXT().exec(
    fileNameLowercase
  )?.[1] as string;

  let ext: string = MyRegex.CAPTURE_EXT().exec(fileNameLowercase)?.[1] ?? '';

  switch (ext) {
    case '.store' satisfies FileExtension:
      content = `store: ${part}`;
      break;
    case '.schema' satisfies FileExtension:
      content = `schema: ${part}`;
      break;
    case '.dashboard' satisfies FileExtension:
      content = `dashboard: ${part}`;
      break;
    case '.chart' satisfies FileExtension:
      content = `chart: ${part}`;
      break;
    case '.report' satisfies FileExtension:
      content = `report: ${part}`;
      break;
    case '.space' satisfies FileExtension:
      content = `space: ${part}`;
      break;
    case '.yml' satisfies FileExtension:
      content = fileName === MPROVE_CONFIG_FILENAME ? 'mprove_dir: ./' : '';
      break;
    case '.md' satisfies FileExtension:
      content = '';
      break;
    default:
      content = '';
  }

  return content;
}
