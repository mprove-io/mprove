import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';
import type { FileReportRowParameter } from '#common/types/blockml/parts/internal/file-report-row-parameter';

let func: Func = 'build-report/check-report-row-unknown-params';

export function checkReportRowUnknownParams(item: {
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

    x.rows
      .filter(row => isDefined(row.parameters))
      .forEach(row => {
        row.parameters.forEach(param => {
          Object.keys(param)
            .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
            .forEach(parameter => {
              if (
                [
                  'apply_to'.toString(),
                  'listen'.toString(),
                  'conditions'.toString(),
                  'fractions'.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: 'UNKNOWN_PARAMETER',
                    message: `parameter "${parameter}" cannot be used inside Parameter`,
                    lines: [
                      {
                        line: param[
                          (parameter + LINE_NUM) as keyof FileReportRowParameter
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
                ['conditions'.toString(), 'fractions'.toString()].indexOf(
                  parameter
                ) < 0 &&
                Array.isArray(param[parameter as keyof FileReportRowParameter])
              ) {
                item.errors.push(
                  new BmError({
                    title: 'UNEXPECTED_LIST_IN_PARAMETERS',
                    message: `parameter "${parameter}" cannot be a list`,
                    lines: [
                      {
                        line: param[
                          (parameter + LINE_NUM) as keyof FileReportRowParameter
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
                param[parameter as keyof FileReportRowParameter]
                  ?.constructor === Object
              ) {
                item.errors.push(
                  new BmError({
                    title: 'UNEXPECTED_DICTIONARY_IN_PARAMETERS',
                    message: `parameter "${parameter}" cannot be a dictionary`,
                    lines: [
                      {
                        line: param[
                          (parameter + LINE_NUM) as keyof FileReportRowParameter
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
                ['conditions'.toString(), 'fractions'.toString()].indexOf(
                  parameter
                ) > -1 &&
                !Array.isArray(param[parameter as keyof FileReportRowParameter])
              ) {
                item.errors.push(
                  new BmError({
                    title: 'PARAMETER_MUST_BE_A_LIST',
                    message: `parameter "${parameter}" must be a list`,
                    lines: [
                      {
                        line: param[
                          (parameter + LINE_NUM) as keyof FileReportRowParameter
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
      });

    if (errorsOnStart === item.errors.length) {
      newReports.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newReports);

  return Result.succeed(newReports);
}
