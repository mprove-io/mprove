import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { ROW_TYPE_VALUES } from '~common/constants/top';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { FileReport } from '~common/interfaces/blockml/internal/file-report';
import { FileReportRow } from '~common/interfaces/blockml/internal/file-report-row';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { MyRegex } from '~common/models/my-regex';
import { log } from '../extra/log';

let func = FuncEnum.CheckReportRow;

export function checkReportRow(
  item: {
    reports: FileReport[];
    metrics: ModelMetric[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, metrics } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newReports: FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows.forEach(row => {
      let rowKeysLineNums: number[] = Object.keys(row)
        .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => row[y as keyof FileReportRow] as number)
        .filter(ln => ln !== 0);

      if (isUndefined(row.row_id)) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_ROW_ID,
            message: `parameter "${ParameterEnum.RowId}" is required for a row`,
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

      if (isUndefined(row.type)) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_ROW_TYPE,
            message: `parameter "${ParameterEnum.Type}" is required for a row`,
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
      } else if (ROW_TYPE_VALUES.indexOf(row.type) < 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.WRONG_ROW_TYPE,
            message: `"${row.type}" value is not valid ${ParameterEnum.Type} for a row`,
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
        [RowTypeEnum.Header, RowTypeEnum.Formula].indexOf(row.type) > -1 &&
        isUndefined(row.name)
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_ROW_NAME,
            message: `parameter "${ParameterEnum.Name}" is required for a row of type "${row.type}"`,
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

      if (row.type === RowTypeEnum.Metric) {
        if (isUndefined(row.metric)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISSING_ROW_METRIC,
              message: `parameter "${ParameterEnum.Metric}" is required for a row of type "${row.type}"`,
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

        if (isUndefined(metric)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.ROW_REFS_MISSING_METRIC,
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
          row.isStore = metric.modelType === ModelTypeEnum.Store;
        }

        if (isUndefined(row.parameters)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISSING_ROW_PARAMETERS,
              message: `"${ParameterEnum.Parameters}" is required for a row of type "${row.type}"`,
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

      if (row.type === RowTypeEnum.Formula && isUndefined(row.formula)) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_ROW_FORMULA,
            message: `parameter "${ParameterEnum.Formula}" is required for a row of type "${row.type}"`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newReports);

  return newReports;
}
