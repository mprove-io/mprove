import { MyRegex } from '#common/classes/my-regex/my-regex';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';

export function getContentFromFileName(item: { fileName: string }): string {
  let { fileName } = item;

  let content: string;

  let fileNameLowercase: string = fileName.toLowerCase();

  let part: string = MyRegex.CAPTURE_FILE_NAME_BEFORE_EXT().exec(
    fileNameLowercase
  )?.[1] as string;

  let ext: string = MyRegex.CAPTURE_EXT().exec(fileNameLowercase)?.[1] ?? '';

  switch (ext) {
    case '.store':
      content = `store: ${part}`;
      break;
    case '.schema':
      content = `schema: ${part}`;
      break;
    case '.dashboard':
      content = `dashboard: ${part}`;
      break;
    case '.chart':
      content = `chart: ${part}`;
      break;
    case '.report':
      content = `report: ${part}`;
      break;
    case '.space':
      content = `space: ${part}`;
      break;
    case '.yml':
      content = fileName === MPROVE_CONFIG_FILENAME ? 'mprove_dir: ./' : '';
      break;
    case '.md':
      content = '';
      break;
    default:
      content = '';
  }

  return content;
}
