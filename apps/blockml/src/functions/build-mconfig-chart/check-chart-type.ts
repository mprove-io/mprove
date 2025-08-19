import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.CheckChartType;

export function checkChartType<T extends dcType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

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

  return newEntities;
}
