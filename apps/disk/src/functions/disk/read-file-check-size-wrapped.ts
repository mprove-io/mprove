import { Result } from '@praha/byethrow';
import type { Stats } from 'fs-extra';
import { ServerError } from '#common/models/server-error';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/disk/errors/file-size-is-too-big-error';
import { readFileCheckSize } from '#node-common/functions/read-file-check-size';

// Temporary bridge for anticipated errors thrown by legacy helpers.
export function readFileCheckSizeWrapped(item: {
  filePath: string | URL;
  getStat: boolean;
}): Result.ResultAsync<
  { content: string; stat?: Stats },
  FileIsSymlinkError | FileSizeIsTooBigError
> {
  let { filePath, getStat } = item;

  let result: Result.ResultAsync<
    { content: string; stat?: Stats },
    FileIsSymlinkError | FileSizeIsTooBigError
  > = Result.try({
    try: (): Promise<{ content: string; stat?: Stats }> => {
      let file: Promise<{ content: string; stat?: Stats }> = readFileCheckSize({
        filePath: filePath,
        getStat: getStat
      });

      return file;
    },
    catch: (error: unknown): FileIsSymlinkError | FileSizeIsTooBigError => {
      if (error instanceof ServerError) {
        if (error.message === 'FILE_IS_SYMLINK') {
          return { code: 'FILE_IS_SYMLINK' };
        }

        if (error.message === 'FILE_SIZE_IS_TOO_BIG') {
          return { code: 'FILE_SIZE_IS_TOO_BIG' };
        }
      }

      throw error;
    }
  });

  return result;
}
