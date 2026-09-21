import { Result } from '@praha/byethrow';
import {
  MPROVE_CONFIG_FILENAME,
  README_FILE_NAME
} from '#common/constants/top';
import type { DiskWriteDefaultInitialProjectFilesError } from '#common/zod/disk/function-errors/disk-write-default-initial-project-files-error';
import type { DiskWriteToFileError } from '#common/zod/disk/function-errors/disk-write-to-file-error';
import { writeToFile } from '#disk/functions/disk/write-to-file/write-to-file';

export function writeDefaultInitialProjectFiles(item: {
  prodDir: string;
  projectName: string;
}): Result.ResultAsync<void, DiskWriteDefaultInitialProjectFilesError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v =>
      writeToFile({
        filePath: `${v.prodDir}/${README_FILE_NAME}`,
        content: `# ${v.projectName} project`
      })
    ),
    Result.andThen((v): Result.ResultAsync<void, DiskWriteToFileError> => {
      let mproveFilePath: string = `${v.prodDir}/${MPROVE_CONFIG_FILENAME}`;

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
