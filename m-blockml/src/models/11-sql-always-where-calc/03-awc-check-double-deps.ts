import { helper } from '~/barrels/helper';
import { enums } from '~/barrels/enums';
import { api } from '~/barrels/api';
import { BmError } from '~/models/bm-error';
import { interfaces } from '~/barrels/interfaces';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.AwcCheckDoubleDeps;

export function awcCheckDoubleDeps(
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

    if (helper.isUndefined(x.sql_always_where_calc)) {
      newModels.push(x);
      return;
    }

    Object.keys(x.sqlAlwaysWhereCalcDoubleDeps).forEach(depAs => {
      let depJoin = x.joins.find(j => j.as === depAs);

      if (helper.isUndefined(depJoin)) {
        item.errors.push(
          new BmError({
            title:
              enums.ErTitleEnum.WRONG_ALIAS_IN_SQL_ALWAYS_WHERE_CALC_REFERENCE,
            message:
              `found referencing on alias "${depAs}" that is ` +
              `missing in joins elements. Check "${enums.ParameterEnum.As}" values.`,
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

      Object.keys(x.sqlAlwaysWhereCalcDoubleDeps[depAs]).forEach(
        depFieldName => {
          let depField = depJoin.view.fields.find(f => f.name === depFieldName);

          if (helper.isUndefined(depField)) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.SQL_ALWAYS_WHERE_CALC_REFS_MISSING_FIELD,
                message:
                  `found referencing to field "${depFieldName}" of ` +
                  `view "${depJoin.view.name}" as "${depAs}"`,
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

          if (depField.fieldClass === api.FieldClassEnum.Filter) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.SQL_ALWAYS_WHERE_CALC_REFS_FILTER,
                message:
                  `"${enums.ParameterEnum.SqlAlwaysWhereCalc}" can not reference filters. ` +
                  `Found referencing filter "${depFieldName}" of ` +
                  `view "${depJoin.view.name}" as "${depAs}"`,
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
        }
      );
    });

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
