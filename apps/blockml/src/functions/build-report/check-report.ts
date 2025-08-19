import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.CheckReport;

export function checkReport(
  item: {
    reports: FileReport[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newReports: FileReport[] = [];

  item.reports.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isUndefined(x.title)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.MISSING_REPORT_TITLE,
          message: `parameter "${ParameterEnum.Title}" is required for report`,
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
          title: ErTitleEnum.MISSING_REPORT_ROWS,
          message: `parameter "${ParameterEnum.Rows}" is required for report`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Reports, newReports);

  return newReports;
}
