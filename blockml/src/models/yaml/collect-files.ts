import * as walk from 'walk';
import * as fs from 'fs';
import { ApRegex } from '../../barrels/am-regex';
import { api } from '../../barrels/api';

export function collectFiles(item: { dir: string }): Promise<api.File[]> {
  return new Promise((resolve, reject) => {

    let files: api.File[] = [];

    let walker = walk.walk(item.dir, { followLinks: false });

    walker.on('file', (root: any, stat: any, next: any) => {
      if (
        !stat.name.match(ApRegex.STARTS_WITH_DOT()) &&
        !stat.name.match(ApRegex.ENDS_WITH_IML()) &&
        !stat.name.match(ApRegex.ENDS_WITH_MD()) &&
        !root.match(ApRegex.GIT_FOLDER()) &&
        !root.match(ApRegex.IDEA_FOLDER())
      ) {
        let fullPath = root + '/' + stat.name;

        let path = fullPath.substr(item.dir.length + 1);

        let pReg = ApRegex.SLASH_G();
        path = path.replace(pReg, '___');

        // recreating absolute path
        let rpReg = ApRegex.TRIPLE_UNDERSCORE_G();

        let relativePath: string = path.replace(rpReg, '/');
        let absolutePath: string = item.dir + '/' + relativePath;

        // Add this file to the list of files
        files.push({
          name: stat.name.toLowerCase(),
          path: path,
          content: fs.readFileSync(absolutePath, 'UTF-8')
        });
      }
      next();
    });

    walker.on('end', () => {
      resolve(files);
    });
  });
}
