import { ConfigService } from '@nestjs/config';
import * as walk from 'walk';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';

let func = enums.FuncEnum.CollectFiles;

export async function collectFiles(
  item: {
    dir: string;
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): Promise<common.BmlFile[]> {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  return new Promise((resolve, reject) => {
    let files: common.BmlFile[] = [];

    let walker = walk.walk(item.dir, { followLinks: false });

    walker.on('file', async (root: any, stat: any, next: any) => {
      if (!stat.name.match(common.MyRegex.IGNORED_FILE_NAMES())) {
        let fullPath = root + '/' + stat.name;

        let path = fullPath.substr(item.dir.length + 1);

        let pReg = common.MyRegex.SLASH_G();
        path = path.replace(pReg, common.TRIPLE_UNDERSCORE);

        // recreating absolute path
        let rpReg = common.MyRegex.TRIPLE_UNDERSCORE_G();

        let relativePath: string = path.replace(rpReg, '/');
        let absolutePath: string = item.dir + '/' + relativePath;

        let { content } = await nodeCommon.readFileCheckSize({
          filePath: absolutePath,
          getStat: false
        });

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
