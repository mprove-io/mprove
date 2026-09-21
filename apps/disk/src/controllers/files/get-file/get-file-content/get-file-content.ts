import { Result } from '@praha/byethrow';
import type { Stats } from 'fs-extra';
import type { DiskGetFileContentError } from '#common/zod/disk/function-errors/disk-get-file-content-error';
import type { ReadFileCheckSizeError } from '#common/zod/node-common/function-errors/read-file-check-size-error';
import { readFileCheckSize } from '#node-common/functions-result/read-file-check-size';

export async function getFileContent(item: {
  filePath: string;
}): Result.ResultAsync<string, DiskGetFileContentError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThen(
      (
        v
      ): Result.ResultAsync<
        { content: string; stat?: Stats },
        ReadFileCheckSizeError
      > =>
        readFileCheckSize({
          filePath: v.filePath,
          getStat: false
        })
    ),
    Result.map((v): string => v.content)
  );
}
