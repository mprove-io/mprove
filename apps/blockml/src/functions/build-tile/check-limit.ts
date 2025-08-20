import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { DEFAULT_LIMIT } from '~common/constants/top';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { MyRegex } from '~common/models/my-regex';
import { dcType } from '~common/types/dc-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckLimit;

export function checkLimit<T extends dcType>(
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

    x.tiles
      // .filter(tile => isUndefined(tile.query))
      .forEach(tile => {
        if (!tile.limit) {
          tile.limit = DEFAULT_LIMIT;
          return;
        }

        let reg = MyRegex.CAPTURE_DIGITS_START_TO_END_G();
        let r = reg.exec(tile.limit);

        if (isUndefined(r)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.TILE_WRONG_LIMIT,
              message: `"${ParameterEnum.Limit}" must contain positive integer value`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
