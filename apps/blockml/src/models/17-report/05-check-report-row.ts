import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckReportRow;

export function checkReportRow(
  item: {
    reports: common.FileReport[];
    metrics: common.ModelMetric[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, metrics } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newReports: common.FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows.forEach(row => {
      let rowKeysLineNums: number[] = Object.keys(row)
        .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => row[y as keyof common.FileReportRow] as number)
        .filter(ln => ln !== 0);

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

      if (row.type === common.RowTypeEnum.Metric) {
        if (common.isUndefined(row.metric)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_ROW_METRIC,
              message: `parameter "${common.ParameterEnum.Metric}" is required for a row of type "${row.type}"`,
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

        let metric = metrics.find(m => m.metricId === row.metric);

        if (common.isUndefined(metric)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.ROW_REFS_MISSING_METRIC,
              message: `metric "${row.metric}" is missing or not valid`,
              lines: [
                {
                  line: row.metric_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else {
          row.model = metric.modelId;
          row.isStore = row.model.startsWith(common.STORE_MODEL_PREFIX);
        }

        if (common.isUndefined(row.parameters)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_ROW_PARAMETERS,
              message: `"${common.ParameterEnum.Parameters}" is required for a row of type "${row.type}"`,
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
      }

      if (
        row.type === common.RowTypeEnum.Formula &&
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
    });

    if (errorsOnStart === item.errors.length) {
      newReports.push(x);
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
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newReports
  );

  return newReports;
}
