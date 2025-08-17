import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartType;

export function checkChartType<T extends types.dcType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      if (common.isUndefined(tile.type)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.TILE_MISSING_TYPE,
            message: `tile must have "${common.ParameterEnum.Type}" parameter`,
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

      if (common.CHART_TYPE_VALUES.indexOf(tile.type) < 0) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.TILE_WRONG_TYPE,
            message: `value "${tile.type}" is not valid "${common.ParameterEnum.Type}"`,
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
