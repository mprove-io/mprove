import { Result } from '@praha/byethrow';
import type { DiskGetFileContentError } from '#common/types/disk/function-errors/disk-get-file-content-error';
import { readFileCheckSize } from '#node-common/functions/read-file-check-size/read-file-check-size';

export async function getFileContent(item: {
  filePath: string;
}): Result.ResultAsync<string, DiskGetFileContentError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThen(v =>
      readFileCheckSize({
        filePath: v.filePath,
        getStat: false
      })
    ),
    Result.map((v): string => v.content)
  );
}
