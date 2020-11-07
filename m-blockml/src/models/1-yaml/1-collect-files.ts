import * as walk from 'walk';
import * as fse from 'fs-extra';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

let logPack = '1-yaml';
let logFolder = '1-collect-files';

export async function collectFiles(item: {
  dir: string;
  structId: string;
}): Promise<api.File[]> {
  let logId = item.structId;
  helper.log(logId, logPack, logFolder, enums.LogEnum.In, item);

  return new Promise((resolve, reject) => {
    let files: api.File[] = [];

    let walker = walk.walk(item.dir, { followLinks: false });

    walker.on('file', async (root: any, stat: any, next: any) => {
      if (
        !stat.name.match(api.MyRegex.STARTS_WITH_DOT()) &&
        !stat.name.match(api.MyRegex.ENDS_WITH_IML()) &&
        !stat.name.match(api.MyRegex.ENDS_WITH_MD()) &&
        !root.match(api.MyRegex.GIT_FOLDER()) &&
        !root.match(api.MyRegex.IDEA_FOLDER())
      ) {
        let fullPath = root + '/' + stat.name;

        let path = fullPath.substr(item.dir.length + 1);

        let pReg = api.MyRegex.SLASH_G();
        path = path.replace(pReg, '___');

        // recreating absolute path
        let rpReg = api.MyRegex.TRIPLE_UNDERSCORE_G();

        let relativePath: string = path.replace(rpReg, '/');
        let absolutePath: string = item.dir + '/' + relativePath;

        let content = await fse.readFile(absolutePath, 'UTF-8');
        // Add this file to the list of files
        files.push({
          name: stat.name.toLowerCase(),
          path: path,
          content: content
        });
      }
      next();
    });

    walker.on('end', () => {
      helper.log(logId, logPack, logFolder, enums.LogEnum.OutErrors, []);
      helper.log(logId, logPack, logFolder, enums.LogEnum.OutFiles, files);
      resolve(files);
    });
  });
}
