import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.JsoCheckDoubleDeps;

export function jsoCheckDoubleDeps(
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
        Object.keys(join.sqlOnDoubleDeps).forEach(depAs => {
          let depJoin = x.joins.find(j => j.as === depAs);

          if (common.isUndefined(depJoin)) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_WRONG_ALIAS_IN_SQL_ON_REFERENCE,
                message:
                  `found reference using alias "${depAs}" that is ` +
                  `missing in joins elements. Check "${common.ParameterEnum.As}" values.`,
                lines: [
                  {
                    line: join.sql_on_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
          Object.keys(join.sqlOnDoubleDeps[depAs]).forEach(depFieldName => {
            let depField = depJoin.view.fields.find(
              f => f.name === depFieldName
            );

            if (common.isUndefined(depField)) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.JOIN_SQL_ON_REFS_MISSING_FIELD,
                  message:
                    `found referencing to field "${depFieldName}" of ` +
                    `view "${depJoin.view.name}" as "${depAs}"`,
                  lines: [
                    {
                      line: join.sql_on_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            if (depField.fieldClass === common.FieldClassEnum.Filter) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.JOIN_SQL_ON_REFS_FILTER,
                  message:
                    `"${common.ParameterEnum.SqlOn}" cannot reference filters. ` +
                    `found referencing filter "${depFieldName}" of ` +
                    `view "${depJoin.view.name}" as "${depAs}"`,
                  lines: [
                    {
                      line: join.sql_on_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            if (depField.fieldClass === common.FieldClassEnum.Measure) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.JOIN_SQL_ON_REFS_MEASURE,
                  message:
                    `"${common.ParameterEnum.SqlOn}" cannot reference measures. ` +
                    `found referencing measure "${depFieldName}" of ` +
                    `view "${depJoin.view.name}" as "${depAs}"`,
                  lines: [
                    {
                      line: join.sql_on_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            if (depField.fieldClass === common.FieldClassEnum.Calculation) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.JOIN_SQL_ON_REFS_CALCULATION,
                  message:
                    `"${common.ParameterEnum.SqlOn}" cannot reference calculations. ` +
                    `found referencing calculation "${depFieldName}" ` +
                    `of view "${depJoin.view.name}" as "${depAs}"`,
                  lines: [
                    {
                      line: join.sql_on_line_num,
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
