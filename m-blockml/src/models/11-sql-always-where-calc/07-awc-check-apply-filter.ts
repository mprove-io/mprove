import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.AwcCheckApplyFilter;

export function awcCheckApplyFilter(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
  cs: ConfigService;
}) {
  let { caller, structId, cs } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (helper.isUndefined(x.sql_always_where_calc)) {
      newModels.push(x);
      return;
    }

    let input = x.sql_always_where_calc;

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

      if (field.fieldClass !== api.FieldClassEnum.Filter) {
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
