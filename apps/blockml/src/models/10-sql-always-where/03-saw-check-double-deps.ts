import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.SawCheckDoubleDeps;

export function sawCheckDoubleDeps(
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

    if (common.isUndefined(x.sql_always_where)) {
      newModels.push(x);
      return;
    }

    Object.keys(x.sqlAlwaysWhereDoubleDeps).forEach(depAs => {
      let depJoin = x.joins.find(j => j.as === depAs);

      if (common.isUndefined(depJoin)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.WRONG_ALIAS_IN_SQL_ALWAYS_WHERE_REFERENCE,
            message:
              `found referencing on alias "${depAs}" that is ` +
              `missing in joins elements. Check "${enums.ParameterEnum.As}" values.`,
            lines: [
              {
                line: x.sql_always_where_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      Object.keys(x.sqlAlwaysWhereDoubleDeps[depAs]).forEach(depFieldName => {
        let depField = depJoin.view.fields.find(f => f.name === depFieldName);

        if (common.isUndefined(depField)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.SQL_ALWAYS_WHERE_REFS_MISSING_FIELD,
              message:
                `found referencing to field "${depFieldName}" of ` +
                `view "${depJoin.view.name}" as "${depAs}"`,
              lines: [
                {
                  line: x.sql_always_where_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );

          return;
        } else if (depField.fieldClass === apiToBlockml.FieldClassEnum.Filter) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.SQL_ALWAYS_WHERE_REFS_FILTER,
              message:
                `"${enums.ParameterEnum.SqlAlwaysWhere}" can not reference filters. ` +
                `Found referencing filter "${depFieldName}" of ` +
                `view "${depJoin.view.name}" as "${depAs}"`,
              lines: [
                {
                  line: x.sql_always_where_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );

          return;
        } else if (
          depField.fieldClass === apiToBlockml.FieldClassEnum.Measure
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.SQL_ALWAYS_WHERE_REFS_MEASURE,
              message:
                `"${enums.ParameterEnum.SqlAlwaysWhere}" can not reference measures. ` +
                `found referencing measure "${depFieldName}" of ` +
                `view "${depJoin.view.name}" as "${depAs}"`,
              lines: [
                {
                  line: x.sql_always_where_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );

          return;
        } else if (
          depField.fieldClass === apiToBlockml.FieldClassEnum.Calculation
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.SQL_ALWAYS_WHERE_REFS_CALCULATION,
              message:
                `"${enums.ParameterEnum.SqlAlwaysWhere}" can not reference calculations. ` +
                `found referencing measure "${depFieldName}" of ` +
                `view "${depJoin.view.name}" as "${depAs}"`,
              lines: [
                {
                  line: x.sql_always_where_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );

          return;
        }
      });
    });

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
