import type { Dirent } from 'node:fs';
import fse from 'fs-extra';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

export async function walkRecursive(item: {
  dir: string;
  symlinks: string[];
}): Promise<void> {
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
      await walkRecursive({ dir: entryPath, symlinks: item.symlinks });
    }
  });
}
