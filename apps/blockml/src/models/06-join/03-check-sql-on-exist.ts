import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckSqlOnExist;

export function checkSqlOnExist(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newModels: common.FileModel[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        if (common.isUndefined(join.sql_on)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.JOIN_MISSING_SQL_ON,
              message:
                `parameter "${common.ParameterEnum.SqlOn}" is ` +
                `required for each "${common.ParameterEnum.JoinView}"`,
              lines: [
                {
                  line: join.join_view_line_num,
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
      newModels.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, newModels);

  return newModels;
}
