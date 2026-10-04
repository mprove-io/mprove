import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';

let func: Func = 'build-report/check-report';

export function checkReport(item: {
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

    if (isUndefined(x.title)) {
      item.errors.push(
        new BmError({
          title: 'MISSING_REPORT_TITLE',
          message: `parameter "title" is required for report`,
          lines: [
            {
              line: x.report_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (isUndefined(x.rows)) {
      item.errors.push(
        new BmError({
          title: 'MISSING_REPORT_ROWS',
          message: `parameter "rows" is required for report`,
          lines: [
            {
              line: x.report_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (errorsOnStart === item.errors.length) {
      newReports.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_reports.log', newReports);

  return Result.succeed(newReports);
}
