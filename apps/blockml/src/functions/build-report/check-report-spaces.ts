import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { FileReport } from '#common/zod/blockml/internal/file-report';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import { log } from '../extra/log';

let func = FuncEnum.CheckReportSpaces;

export function checkReportSpaces(
  item: {
    reports: FileReport[];
    spaces: FileSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  item.reports.forEach(report => {
    let space: FileSpace | undefined;

    if (isDefined(report.space)) {
      space = item.spaces.find(x => x.space === report.space);

      if (isDefined(space) === false) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.SPACE_DOES_NOT_EXIST,
            message: `${ParameterEnum.Report} "${report.name}" references space "${report.space}" that does not exist`,
            lines: [
              {
                line: report.space_line_num,
                name: report.fileName,
                path: report.filePath
              }
            ]
          })
        );
      }
    }

    report.accessRolesCombined = [
      ...new Set([
        ...(space?.accessRolesCombined ?? []),
        ...(report.access_roles ?? [])
      ])
    ];
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Reports, item.reports);

  return item.reports;
}
