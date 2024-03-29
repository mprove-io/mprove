import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckLimit;

export function checkLimit<T extends types.dzType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (!report.limit) {
        report.limit = common.DEFAULT_LIMIT;
        return;
      }

      let reg = common.MyRegex.CAPTURE_DIGITS_START_TO_END_G();
      let r = reg.exec(report.limit);

      if (common.isUndefined(r)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.REPORT_WRONG_LIMIT,
            message: `"${enums.ParameterEnum.Limit}" must contain positive integer value`,
            lines: [
              {
                line: report.limit_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      let limitNumber = Number(r[1]);

      report.limit =
        limitNumber > Number(common.DEFAULT_LIMIT)
          ? common.DEFAULT_LIMIT
          : limitNumber.toString();
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
