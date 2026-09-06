import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import { DiskFileIsSymlinkError } from './errors/disk-file-is-symlink-error';

export async function writeToFile(item: {
  filePath: string;
  content: string;
}): Result.ResultAsync<void, DiskFileIsSymlinkError> {
  let { filePath, content } = item;

  let stat: fse.Stats | undefined;
  try {
    stat = await fse.lstat(filePath);
  } catch (e: any) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  if (stat?.isSymbolicLink() === true) {
    return Result.fail(new DiskFileIsSymlinkError());
  }

  await fse.writeFile(filePath, content);

  return Result.succeed();
}
