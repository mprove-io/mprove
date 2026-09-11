import type { Dirent } from 'node:fs';
import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import pIteration from 'p-iteration';
import type { DiskSymlinksFoundError } from '#common/zod/disk/errors/disk-symlinks-found-error';

const { forEachSeries } = pIteration;

export async function checkSymlinksInDir(item: {
  dir: string;
}): Result.ResultAsync<void, DiskSymlinksFoundError> {
  let dirExists: boolean = await fse.pathExists(item.dir);

  if (dirExists === false) {
    return Result.succeed();
  }

  let symlinks: string[] = [];

  await walk({ dir: item.dir, symlinks: symlinks });

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

async function walk(item: { dir: string; symlinks: string[] }): Promise<void> {
  let dirents: Dirent[] = await fse.readdir(item.dir, {
    withFileTypes: true
  });

  await forEachSeries(dirents, async dirent => {
    let entryPath = `${item.dir}/${dirent.name}`;

    if (dirent.isSymbolicLink() === true) {
      let target: string;

      try {
        target = await fse.readlink(entryPath);
      } catch {
        target = '<unreadable>';
      }

      item.symlinks.push(`${entryPath} -> ${target}`);

      return;
    }

    if (dirent.isDirectory() === true) {
      await walk({ dir: entryPath, symlinks: item.symlinks });
    }
  });
}
