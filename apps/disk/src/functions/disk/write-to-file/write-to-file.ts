import { Result } from '@praha/byethrow';
import fse from 'fs-extra';

import type { DiskWriteToFileError } from '#common/zod/disk/function-errors/disk-write-to-file-error';

export async function writeToFile(item: {
  filePath: string;
  content: string;
}): Result.ResultAsync<void, DiskWriteToFileError> {
  let stat: fse.Stats | undefined;

  try {
    stat = await fse.lstat(item.filePath);
  } catch (e: any) {
    // ENOENT is expected for a new file. Leave stat undefined and let writeFile
    // create it; a missing parent directory will still cause the write to fail.
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  if (stat?.isSymbolicLink() === true) {
    return Result.fail({ code: 'FILE_IS_SYMLINK' });
  }

  await fse.writeFile(item.filePath, item.content);

  return Result.succeed();
}
