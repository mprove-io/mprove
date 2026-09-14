import { Result } from '@praha/byethrow';
import fse, { type Stats } from 'fs-extra';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/disk/errors/file-size-is-too-big-error';

export async function readFileCheckSize(item: {
  filePath: string | URL;
  getStat: boolean;
}): Result.ResultAsync<
  { content: string; stat?: Stats },
  FileIsSymlinkError | FileSizeIsTooBigError
> {
  let { filePath, getStat } = item;

  let stat: Stats = await fse.lstat(filePath);

  if (stat.isSymbolicLink() === true) {
    return Result.fail({ code: 'FILE_IS_SYMLINK' });
  }

  let fileSizeInBytes: number = stat.size;
  let fileSizeInMegabytes: number = fileSizeInBytes / (1024 * 1024);

  if (fileSizeInMegabytes > 5) {
    return Result.fail({ code: 'FILE_SIZE_IS_TOO_BIG' });
  }

  let content: string = <string>await fse.readFile(filePath, 'utf8');

  return Result.succeed({
    content: content,
    stat: getStat === true ? stat : undefined
  });
}
