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
    // ENOENT is expected for a new file. Leave stat undefined and let writeFile
    // create it; a missing parent directory will still cause the write to fail.
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
