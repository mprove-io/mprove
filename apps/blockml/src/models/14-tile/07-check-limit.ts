import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckLimit;

export function checkLimit<T extends types.dzType>(
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

    x.tiles
      // .filter(tile => common.isUndefined(tile.query))
      .forEach(tile => {
        if (!tile.limit) {
          tile.limit = common.DEFAULT_LIMIT;
          return;
        }

        let reg = common.MyRegex.CAPTURE_DIGITS_START_TO_END_G();
        let r = reg.exec(tile.limit);

        if (common.isUndefined(r)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.TILE_WRONG_LIMIT,
              message: `"${common.ParameterEnum.Limit}" must contain positive integer value`,
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
          limitNumber > Number(common.DEFAULT_LIMIT)
            ? common.DEFAULT_LIMIT
            : limitNumber.toString();
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
