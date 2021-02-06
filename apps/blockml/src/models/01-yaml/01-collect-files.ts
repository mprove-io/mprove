import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import * as walk from 'walk';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.CollectFiles;

export async function collectFiles(
  item: {
    dir: string;
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): Promise<apiToBlockml.File[]> {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  return new Promise((resolve, reject) => {
    let files: apiToBlockml.File[] = [];

    let walker = walk.walk(item.dir, { followLinks: false });

    walker.on('file', async (root: any, stat: any, next: any) => {
      if (
        !stat.name.match(common.MyRegex.STARTS_WITH_DOT()) &&
        !stat.name.match(common.MyRegex.ENDS_WITH_IML()) &&
        !stat.name.match(common.MyRegex.ENDS_WITH_MD()) &&
        !root.match(common.MyRegex.GIT_FOLDER()) &&
        !root.match(common.MyRegex.IDEA_FOLDER())
      ) {
        let fullPath = root + '/' + stat.name;

        let path = fullPath.substr(item.dir.length + 1);

        let pReg = common.MyRegex.SLASH_G();
        path = path.replace(pReg, common.TRIPLE_UNDERSCORE);

        // recreating absolute path
        let rpReg = common.MyRegex.TRIPLE_UNDERSCORE_G();

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
      helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, []);
      helper.log(cs, caller, func, structId, enums.LogTypeEnum.Files, files);
      resolve(files);
    });
  });
}
