import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import { DiskFileIsSymlinkError } from './errors/disk-file-is-symlink-error';

export async function writeToFile(item: {
  filePath: string;
  content: string;
}): Result.ResultAsync<void, DiskFileIsSymlinkError> {
  let stat: fse.Stats | undefined;

  try {
    stat = await fse.lstat(item.filePath);
  } catch (e: any) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  if (stat?.isSymbolicLink() === true) {
    return Result.fail(new DiskFileIsSymlinkError());
  }

  await fse.writeFile(item.filePath, item.content);

  return Result.succeed();
}
