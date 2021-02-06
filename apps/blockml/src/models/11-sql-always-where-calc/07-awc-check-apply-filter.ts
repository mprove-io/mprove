import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.AwcCheckApplyFilter;

export function awcCheckApplyFilter(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (helper.isUndefined(x.sql_always_where_calc)) {
      newModels.push(x);
      return;
    }

    let input = x.sql_always_where_calc;

    let reg = common.MyRegex.CAPTURE_START_FIELD_TARGET_END();
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
                .SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_REFS_MISSING_FILTER,
            message: `Filter "${fieldName}" is missing or not valid`,
            lines: [
              {
                line: x.sql_always_where_calc_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (field.fieldClass !== apiToBlockml.FieldClassEnum.Filter) {
        item.errors.push(
          new BmError({
            title:
              enums.ErTitleEnum
                .SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_MUST_REFERENCE_A_FILTER,
            message: `Found field "${fieldName}" that is ${field.fieldClass}`,
            lines: [
              {
                line: x.sql_always_where_calc_line_num,
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

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
