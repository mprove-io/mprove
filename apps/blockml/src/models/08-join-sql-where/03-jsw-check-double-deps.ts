import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.JswCheckDoubleDeps;

export function jswCheckDoubleDeps(
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
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        Object.keys(join.sqlWhereDoubleDeps).forEach(depAs => {
          let depJoin = x.joins.find(j => j.as === depAs);

          if (helper.isUndefined(depJoin)) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.JOIN_WRONG_ALIAS_IN_SQL_WHERE_REFERENCE,
                message:
                  `found reference using alias "${depAs}" that is ` +
                  `missing in joins elements. Check "${enums.ParameterEnum.As}" values.`,
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

          Object.keys(join.sqlWhereDoubleDeps[depAs]).forEach(depFieldName => {
            let depField = depJoin.view.fields.find(
              f => f.name === depFieldName
            );

            if (helper.isUndefined(depField)) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.JOIN_SQL_WHERE_REFS_MISSING_FIELD,
                  message:
                    `found referencing to field "${depFieldName}" of ` +
                    `view "${depJoin.view.name}" as "${depAs}"`,
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
            } else if (depField.fieldClass === api.FieldClassEnum.Filter) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.JOIN_SQL_WHERE_REFS_FILTER,
                  message:
                    `"${enums.ParameterEnum.SqlWhere}" can not reference filters. ` +
                    `found referencing filter "${depFieldName}" of ` +
                    `view "${depJoin.view.name}" as "${depAs}"`,
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
            } else if (depField.fieldClass === api.FieldClassEnum.Measure) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.JOIN_SQL_WHERE_REFS_MEASURE,
                  message:
                    `"${enums.ParameterEnum.SqlWhere}" can not reference measures. ` +
                    `found referencing measure "${depFieldName}" of ` +
                    `view "${depJoin.view.name}" as "${depAs}"`,
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
            } else if (depField.fieldClass === api.FieldClassEnum.Calculation) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.JOIN_SQL_WHERE_REFS_CALCULATION,
                  message:
                    `"${enums.ParameterEnum.SqlWhere}" can not reference calculations. ` +
                    `found referencing calculation "${depFieldName}" of ` +
                    `view "${depJoin.view.name}" as "${depAs}"`,
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
          });
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
