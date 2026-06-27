import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { makeAccessRolesCombined } from '#common/functions/space/make-access-roles-combined';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileReport } from '#common/zod/blockml/internal/file-report';
import { getSpaceFromFilePath } from '../extra/get-space-from-file-path';
import { log } from '../extra/log';

let func = FuncEnum.MakeReportAccessRolesCombined;

export function makeReportAccessRolesCombined(
  item: {
    reports: FileReport[];
    spaces: FilePartSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  item.reports.forEach(report => {
    let space: FilePartSpace | undefined;

    report.space = getSpaceFromFilePath({
      filePath: report.filePath,
      spaces: item.spaces
    });

    space = item.spaces.find(x => x.space === report.space);

    report.accessRolesCombined = makeAccessRolesCombined({
      accessRoles: report.access_roles ?? [],
      accessRolesInherited: space?.accessRolesCombined ?? []
    });
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Reports, item.reports);

  return item.reports;
}
