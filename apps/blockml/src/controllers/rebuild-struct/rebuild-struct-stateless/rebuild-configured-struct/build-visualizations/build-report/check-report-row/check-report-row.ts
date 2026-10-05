import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';
import type { FileReportRow } from '#common/types/blockml/parts/internal/file-report-row';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import {
  type RowType,
  rowTypeValues
} from '#common/types/blockml/parts/report/row/row-type';

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
            message: `parameter "${'row_id' satisfies FileParameter}" is required for a row`,
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
            message: `parameter "${'type' satisfies FileParameter}" is required for a row`,
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
      } else if (rowTypeValues.indexOf(row.type) < 0) {
        item.errors.push(
          new BmError({
            title: 'WRONG_ROW_TYPE',
            message: `"${row.type}" value is not valid ${'type' satisfies FileParameter} for a row`,
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
        (['header', 'formula'] satisfies RowType[]).some(
          candidate => candidate === row.type
        ) &&
        isUndefined(row.name)
      ) {
        item.errors.push(
          new BmError({
            title: 'MISSING_ROW_NAME',
            message: `parameter "${'name' satisfies FileParameter}" is required for a row of type "${row.type}"`,
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
              message: `parameter "${'metric' satisfies FileParameter}" is required for a row of type "${row.type}"`,
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
              message: `"${'parameters' satisfies FileParameter}" is required for a row of type "${row.type}"`,
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
            message: `parameter "${'formula' satisfies FileParameter}" is required for a row of type "${row.type}"`,
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
