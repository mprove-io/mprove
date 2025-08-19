import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

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
