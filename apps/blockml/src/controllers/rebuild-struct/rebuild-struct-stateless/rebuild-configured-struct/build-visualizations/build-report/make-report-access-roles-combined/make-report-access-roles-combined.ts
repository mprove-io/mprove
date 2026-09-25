import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { getSpaceFromFilePath } from '#blockml/functions/get-space-from-file-path/get-space-from-file-path';
import { log } from '#blockml/functions/log/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { makeAccessRolesCombined } from '#common/functions/make-access-roles-combined/make-access-roles-combined';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileReport } from '#common/zod/blockml/internal/file-report';

let func = FuncEnum.MakeReportAccessRolesCombined;

export function makeReportAccessRolesCombined(item: {
  reports: FileReport[];
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileReport[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, input);

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

  return Result.succeed(item.reports);
}
