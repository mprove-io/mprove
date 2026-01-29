import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { FileReport } from '#common/interfaces/blockml/internal/file-report';
import { log } from '../extra/log';

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
