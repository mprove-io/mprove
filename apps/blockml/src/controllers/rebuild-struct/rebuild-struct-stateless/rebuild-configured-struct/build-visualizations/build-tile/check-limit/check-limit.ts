import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { DEFAULT_LIMIT } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { dcType } from '#common/types/blockml/parts/internal/dc-type';

let func: Func = 'build-tile/check-limit';

export function checkLimit<T extends dcType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, 'input.log', input);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      if (!tile.limit) {
        tile.limit = DEFAULT_LIMIT;
        return;
      }

      let reg = MyRegex.CAPTURE_DIGITS_START_TO_END_G();
      let r = reg.exec(tile.limit);

      if (isUndefined(r)) {
        item.errors.push(
          new BmError({
            title: 'TILE_WRONG_LIMIT',
            message: `"${'limit' satisfies FileParameter}" must contain positive integer value`,
            lines: [
              {
                line: tile.limit_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      let limitNumber = Number(r[1]);

      tile.limit =
        limitNumber > Number(DEFAULT_LIMIT)
          ? DEFAULT_LIMIT
          : limitNumber.toString();
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
