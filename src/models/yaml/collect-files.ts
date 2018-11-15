import * as walk from 'walk';
import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function collectFiles(item: {
  dir: string;
}): Promise<interfaces.File[]> {
  return new Promise((resolve, reject) => {
    // if (Math.random() < 0.5) { throw new Error('boom1'); }

    let files: interfaces.File[] = [];

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

        // Add this file to the list of files
        files.push({
          name: stat.name.toLowerCase(),
          path: path
        });
      }
      next();
    });

    walker.on('end', () => {
      resolve(files);
    });
  });
}
