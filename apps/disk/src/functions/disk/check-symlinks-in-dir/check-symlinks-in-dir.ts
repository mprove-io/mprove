import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import type { DiskCheckSymlinksInDirError } from '#common/zod/disk/function-errors/disk-check-symlinks-in-dir-error';
import { walkRecursive } from './walk-recursive/walk-recursive';

export async function checkSymlinksInDir(item: {
  dir: string;
}): Result.ResultAsync<void, DiskCheckSymlinksInDirError> {
  let dirExists: boolean = await fse.pathExists(item.dir);

  if (dirExists === false) {
    return Result.succeed();
  }

  let symlinks: string[] = [];

  await walkRecursive({ dir: item.dir, symlinks: symlinks });

  if (symlinks.length > 0) {
    return Result.fail({
      code: 'DISK_SYMLINKS_FOUND',
      displayData: {
        dir: item.dir,
        symlinks: symlinks
      }
    });
  }

  return Result.succeed();
}
