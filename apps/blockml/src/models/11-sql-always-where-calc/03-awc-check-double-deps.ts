import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.AwcCheckDoubleDeps;

export function awcCheckDoubleDeps(
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

    if (common.isUndefined(x.sql_always_where_calc)) {
      newModels.push(x);
      return;
    }

    Object.keys(x.sqlAlwaysWhereCalcDoubleDeps).forEach(depAs => {
      let depJoin = x.joins.find(j => j.as === depAs);

      if (common.isUndefined(depJoin)) {
        item.errors.push(
          new BmError({
            title:
              common.ErTitleEnum.WRONG_ALIAS_IN_SQL_ALWAYS_WHERE_CALC_REFERENCE,
            message:
              `found referencing on alias "${depAs}" that is ` +
              `missing in joins elements. Check "${common.ParameterEnum.As}" values.`,
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

          if (common.isUndefined(depField)) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum.SQL_ALWAYS_WHERE_CALC_REFS_MISSING_FIELD,
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

          if (depField.fieldClass === common.FieldClassEnum.Filter) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.SQL_ALWAYS_WHERE_CALC_REFS_FILTER,
                message:
                  `"${common.ParameterEnum.SqlAlwaysWhereCalc}" cannot reference filters. ` +
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
