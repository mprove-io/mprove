import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.JswCheckApplyFilter;

export function jswCheckApplyFilter(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.joins
      .filter(j => j.as !== x.fromAs && helper.isDefined(j.sql_where))
      .forEach(join => {
        let input = join.sql_where;

        let reg = api.MyRegex.CAPTURE_START_FIELD_TARGET_END();
        let r;

        while ((r = reg.exec(input))) {
          let start = r[1];
          let fieldName = r[2];
          let target = r[3];
          let end = r[4];

          let field = x.fields.find(f => f.name === fieldName);

          if (helper.isUndefined(field)) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum
                    .JOIN_SQL_WHERE_APPLY_FILTER_REFS_MISSING_FILTER,
                message: `Filter "${fieldName}" is missing or not valid`,
                lines: [
                  {
                    line: join.sql_where_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (field.fieldClass !== api.FieldClassEnum.Filter) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum
                    .JOIN_SQL_WHERE_APPLY_FILTER_MUST_REFERENCE_A_FILTER,
                message: `Found field "${fieldName}" that is ${field.fieldClass}`,
                lines: [
                  {
                    line: join.sql_where_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          input = start + end;
        }
      });

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
