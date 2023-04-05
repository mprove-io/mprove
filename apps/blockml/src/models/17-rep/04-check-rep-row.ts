import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckRepRow;

export function checkRepRow(
  item: {
    reps: common.FileRep[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newReps: common.FileRep[] = [];

  item.reps.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows.forEach(row => {
      let rowKeysLineNums: number[] = Object.keys(row)
        .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => row[y as keyof common.FileRepRow] as number);

      if (common.isUndefined(row.row_id)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_ROW_ID,
            message: `parameter "${common.ParameterEnum.RowId}" is required for a row`,
            lines: [
              {
                line: Math.min(...rowKeysLineNums),
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (common.isUndefined(row.type)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_ROW_TYPE,
            message: `parameter "${common.ParameterEnum.Type}" is required for a row`,
            lines: [
              {
                line: row.row_id_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      } else if (common.ROW_TYPE_VALUES.indexOf(row.type) < 0) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_ROW_TYPE,
            message: `"${row.type}" value is not valid ${common.ParameterEnum.Type} for a row`,
            lines: [
              {
                line: row.type_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        [common.RowTypeEnum.Header, common.RowTypeEnum.Formula].indexOf(
          row.type
        ) > -1 &&
        common.isUndefined(row.name)
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_ROW_NAME,
            message: `parameter "${common.ParameterEnum.Name}" is required for a row of type "${row.type}"`,
            lines: [
              {
                line: row.row_id_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        [common.RowTypeEnum.Metric].indexOf(row.type) > -1 &&
        common.isUndefined(row.parameters) &&
        common.isUndefined(row.parameters_formula)
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_ROW_PARAMETERS,
            message:
              `one of parameters "${common.ParameterEnum.Parameters}", ` +
              `"${common.ParameterEnum.ParametersFormula}" is required for a row of type "${row.type}"`,
            lines: [
              {
                line: row.row_id_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        [common.RowTypeEnum.Formula].indexOf(row.type) > -1 &&
        common.isUndefined(row.formula)
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_ROW_FORMULA,
            message: `parameter "${common.ParameterEnum.Formula}" is required for a row of type "${row.type}"`,
            lines: [
              {
                line: row.row_id_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (common.isDefined(row.parameters)) {
        row.parameters.forEach(p => {
          let pKeysLineNums: number[] = Object.keys(p)
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => p[y as keyof common.FileRepRowParameter] as number);

          if (common.isUndefined(p.filter)) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MISSING_FILTER,
                message: `parameter "${common.ParameterEnum.Filter}" is required`,
                lines: [
                  {
                    line: Math.min(...pKeysLineNums),
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            common.isUndefined(p.conditions) &&
            common.isUndefined(p.formula)
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MISSING_CONDITIONS_OR_FORMULA,
                message:
                  `one of parameters "${common.ParameterEnum.Conditions}", ` +
                  `"${common.ParameterEnum.Formula}" is required for a parameter`,
                lines: [
                  {
                    line: Math.min(...pKeysLineNums),
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        });
      }
    });

    if (errorsOnStart === item.errors.length) {
      newReps.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Entities, newReps);

  return newReps;
}
