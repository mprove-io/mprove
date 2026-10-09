import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import walk from 'walk';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { BmlFile } from '#common/types/blockml/parts/file/bml-file';
import type { ReadFileCheckSizeError } from '#common/types/node-common/function-errors/read-file-check-size-error';
import {
  type ReadFileCheckSizeOutput,
  readFileCheckSize
} from '#node-common/functions/read-file-check-size/read-file-check-size';

let func: Func = 'extra/collect-files';

export async function collectFiles(
  item: {
    dir: string;
    repoDir: string;
    structId: string;
    caller: Caller;
    skipLog: boolean;
  },
  cs: ConfigService<BlockmlConfig>
): Promise<BmlFile[]> {
  let { caller, structId, skipLog } = item;

  if (skipLog === false) {
    log(cs, caller, func, structId, 'input.log', item);
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

        let { content } = await Result.unwrap(
          Result.pipe(
            Result.succeed({
              filePath: absolutePath,
              getStat: false
            }),
            Result.andThen(
              (
                v
              ): Result.ResultAsync<
                ReadFileCheckSizeOutput,
                ReadFileCheckSizeError
              > =>
                readFileCheckSize({ filePath: v.filePath, getStat: v.getStat })
            ),
            Result.mapError(v => new ServerError({ message: v.code }))
          )
        );

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
        log(cs, caller, func, structId, 'out_errors.log', []);
        log(cs, caller, func, structId, 'out_files.log', files);
      }
      resolve(files);
    });
  });
}
