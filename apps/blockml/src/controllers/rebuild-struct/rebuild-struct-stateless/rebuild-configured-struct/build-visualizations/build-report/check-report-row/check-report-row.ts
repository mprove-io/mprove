import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { ROW_TYPE_VALUES } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';
import type { FileReportRow } from '#common/types/blockml/parts/internal/file-report-row';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';

let func: Func = 'build-report/check-report-row';

export function checkReportRow(item: {
  reports: FileReport[];
  metrics: ModelMetric[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileReport[], never> {
  let { cs, ...input } = item;

  let { caller, structId, metrics } = item;

  log(cs, caller, func, structId, 'input.log', input);

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
            title: 'MISSING_ROW_ID',
            message: `parameter "row_id" is required for a row`,
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
            title: 'MISSING_ROW_TYPE',
            message: `parameter "type" is required for a row`,
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
            title: 'WRONG_ROW_TYPE',
            message: `"${row.type}" value is not valid type for a row`,
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
        ['header', 'formula'].indexOf(row.type) > -1 &&
        isUndefined(row.name)
      ) {
        item.errors.push(
          new BmError({
            title: 'MISSING_ROW_NAME',
            message: `parameter "name" is required for a row of type "${row.type}"`,
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

      if (row.type === 'metric') {
        if (isUndefined(row.metric)) {
          item.errors.push(
            new BmError({
              title: 'MISSING_ROW_METRIC',
              message: `parameter "metric" is required for a row of type "${row.type}"`,
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
              title: 'ROW_REFS_MISSING_METRIC',
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
          row.isStore = metric.modelType === 'Store';
        }

        if (isUndefined(row.parameters)) {
          item.errors.push(
            new BmError({
              title: 'MISSING_ROW_PARAMETERS',
              message: `"parameters" is required for a row of type "${row.type}"`,
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

      if (row.type === 'formula' && isUndefined(row.formula)) {
        item.errors.push(
          new BmError({
            title: 'MISSING_ROW_FORMULA',
            message: `parameter "formula" is required for a row of type "${row.type}"`,
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newReports);

  return Result.succeed(newReports);
}
