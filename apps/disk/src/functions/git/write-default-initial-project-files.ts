import { Result } from '@praha/byethrow';
import {
  MPROVE_CONFIG_FILENAME,
  README_FILE_NAME
} from '#common/constants/top';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import { writeToFile } from '../disk/write-to-file';

export function writeDefaultInitialProjectFiles(item: {
  prodDir: string;
  projectName: string;
}): Result.ResultAsync<void, FileIsSymlinkError> {
  let readmeFilePath: string = `${item.prodDir}/${README_FILE_NAME}`;

  let readmeContent: string = `# ${item.projectName} project`;

  return Result.pipe(
    writeToFile({
      filePath: readmeFilePath,
      content: readmeContent
    }),
    Result.andThen(() => {
      let mproveFilePath: string = `${item.prodDir}/${MPROVE_CONFIG_FILENAME}`;

      let mproveContent: string = `mprove_dir: ./
case_sensitive_string_filters: false
format_number: ''
thousands_separator: ','
currency_prefix: '$'
currency_suffix: ''
`;

      return writeToFile({
        filePath: mproveFilePath,
        content: mproveContent
      });
    })
  );
}
