import fse from 'fs-extra';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

export async function checkSymlinksInDir(item: { dir: string }) {
  let { dir } = item;

  let dirExists = await fse.pathExists(dir);
  if (dirExists === false) {
    return;
  }

  let symlinks: string[] = [];
  await walk({ dir: dir, symlinks: symlinks });

  if (symlinks.length > 0) {
    throw new Error(
      `Symlinks found under ${dir}. Remove them before starting disk:\n` +
        symlinks.join('\n')
    );
  }
}

async function walk(item: { dir: string; symlinks: string[] }) {
  let { dir, symlinks } = item;

  let dirents = await fse.readdir(dir, { withFileTypes: true });

  await forEachSeries(dirents, async dirent => {
    let entryPath = `${dir}/${dirent.name}`;

    if (dirent.isSymbolicLink() === true) {
      let target: string;
      try {
        target = await fse.readlink(entryPath);
      } catch {
        target = '<unreadable>';
      }
      symlinks.push(`${entryPath} -> ${target}`);
      return;
    }

    if (dirent.isDirectory() === true) {
      await walk({ dir: entryPath, symlinks: symlinks });
    }
  });
}
