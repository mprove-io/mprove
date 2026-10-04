import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { FileReport } from '#common/types/blockml/parts/internal/file-report';
import type { FileReportRow } from '#common/types/blockml/parts/internal/file-report-row';

let func: Func = 'build-report/check-report-row-unknown-parameters';

export function checkReportRowUnknownParameters(item: {
  reports: FileReport[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileReport[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, 'input.log', input);

  let newReports: FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.rows.forEach(row => {
      Object.keys(row)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              'row_id'.toString(),
              'type'.toString(),
              'name'.toString(),
              'metric'.toString(),
              'show_chart'.toString(),
              'formula'.toString(),
              'parameters'.toString(),
              'format_number'.toString(),
              'currency_prefix'.toString(),
              'currency_suffix'.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'UNKNOWN_ROW_PARAMETER',
                message: `parameter "${parameter}" cannot be used inside Row`,
                lines: [
                  {
                    line: row[
                      (parameter + LINE_NUM) as keyof FileReportRow
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            ['parameters'.toString()].indexOf(parameter) < 0 &&
            Array.isArray(row[parameter as keyof FileReportRow])
          ) {
            item.errors.push(
              new BmError({
                title: 'UNEXPECTED_LIST_IN_ROW_PARAMETERS',
                message: `parameter "${parameter}" cannot be a list`,
                lines: [
                  {
                    line: row[
                      (parameter + LINE_NUM) as keyof FileReportRow
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (row[parameter as keyof FileReportRow]?.constructor === Object) {
            item.errors.push(
              new BmError({
                title: 'UNEXPECTED_DICTIONARY_IN_ROW_PARAMETERS',
                message: `parameter "${parameter}" cannot be a dictionary`,
                lines: [
                  {
                    line: row[
                      (parameter + LINE_NUM) as keyof FileReportRow
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            ['parameters'.toString()].indexOf(parameter) > -1 &&
            !Array.isArray(row[parameter as keyof FileReportRow])
          ) {
            item.errors.push(
              new BmError({
                title: 'ROW_PARAMETER_MUST_BE_A_LIST',
                message: `parameter "${parameter}" must be a list`,
                lines: [
                  {
                    line: row[
                      (parameter + LINE_NUM) as keyof FileReportRow
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            ['show_chart'.toString()].indexOf(parameter) > -1 &&
            !(row[parameter as keyof FileReportRow] as any)
              .toString()
              .match(MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: 'ROW_WRONG_PARAMETER_VALUE',
                message:
                  `parameter "${parameter}" value must be ` +
                  '"true" or "false" if specified',
                lines: [
                  {
                    line: row[
                      (parameter + LINE_NUM) as keyof FileReportRow
                    ] as number,
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
      newReports.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newReports);

  return Result.succeed(newReports);
}
