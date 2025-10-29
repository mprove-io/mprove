import { ConfigService } from '@nestjs/config';
import * as walk from 'walk';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { MyRegex } from '~common/models/my-regex';
import { readFileCheckSize } from '~node-common/functions/read-file-check-size';
import { log } from '../extra/log';

let func = FuncEnum.CollectFiles;

export async function collectFiles(
  item: {
    dir: string;
    repoDir: string;
    structId: string;
    caller: CallerEnum;
    skipLog: boolean;
  },
  cs: ConfigService<BlockmlConfig>
): Promise<BmlFile[]> {
  let { caller, structId, skipLog } = item;

  if (skipLog === false) {
    log(cs, caller, func, structId, LogTypeEnum.Input, item);
  }

  return new Promise((resolve, reject) => {
    let files: BmlFile[] = [];

    let walker = walk.walk(item.dir, { followLinks: false });

    walker.on('file', async (root: any, stat: any, next: any) => {
      if (!stat.name.match(MyRegex.IGNORED_FILE_NAMES())) {
        let fullPath = root + '/' + stat.name;

        let pathRelativeToRepo = isDefined(item.repoDir)
          ? fullPath.substr(item.repoDir.length + 1)
          : undefined;

        fullPath.substr(item.dir.length + 1);

        let path = fullPath.substr(item.dir.length + 1);

        let relativePath = path;
        let absolutePath = item.dir + '/' + relativePath;

        let { content } = await readFileCheckSize({
          filePath: absolutePath,
          getStat: false
        });

        files.push({
          name: stat.name.toLowerCase(),
          path: path,
          content: content,
          pathRelativeToRepo: pathRelativeToRepo
        });
      }
      next();
    });

    walker.on('end', () => {
      if (skipLog === false) {
        log(cs, caller, func, structId, LogTypeEnum.Errors, []);
        log(cs, caller, func, structId, LogTypeEnum.Files, files);
      }
      resolve(files);
    });
  });
}
