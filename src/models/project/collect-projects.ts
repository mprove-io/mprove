import { ApRegex } from '../../barrels/am-regex';

let fse = require('fs-extra');

const { forEach } = require('p-iteration');

export async function collectProjects(item: {
  dir: string;
}): Promise<string[]> {
  let dirs: string[] = [];
  let files: string[] = [];

  files = await fse.readdir(item.dir);

  await forEach(files, async (file: any) => {
    if (!file.match(ApRegex.STARTS_WITH_DOT())) {
      let filePath = item.dir + '/' + file;

      let stat = await fse.stat(filePath);

      if (stat.isDirectory()) {
        dirs.push(file);
      }
    }
  });

  return dirs;
}
