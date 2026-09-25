import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { CHART_TYPE_VALUES } from '#common/constants/top';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { dcType } from '#common/types/dc-type';

let func = FuncEnum.CheckChartType;

export function checkChartType<T extends dcType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, LogTypeEnum.Input, input);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      if (isUndefined(tile.type)) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TILE_MISSING_TYPE,
            message: `tile must have "${ParameterEnum.Type}" parameter`,
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

      if (CHART_TYPE_VALUES.indexOf(tile.type) < 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TILE_WRONG_TYPE,
            message: `value "${tile.type}" is not valid "${ParameterEnum.Type}"`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return Result.succeed(newEntities);
}
