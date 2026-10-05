import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import { chartTypeValues } from '#common/types/blockml/parts/chart/chart-type';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { dcType } from '#common/types/blockml/parts/internal/dc-type';

let func: Func = 'build-mconfig-chart/check-chart-type';

export function checkChartType<T extends dcType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, 'input.log', input);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      if (isUndefined(tile.type)) {
        item.errors.push(
          new BmError({
            title: 'TILE_MISSING_TYPE',
            message: `tile must have "${'type' satisfies FileParameter}" parameter`,
            lines: [
              {
                line: tile.title_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (chartTypeValues.indexOf(tile.type) < 0) {
        item.errors.push(
          new BmError({
            title: 'TILE_WRONG_TYPE',
            message: `value "${tile.type}" is not valid "${'type' satisfies FileParameter}"`,
            lines: [
              {
                line: tile.type_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
