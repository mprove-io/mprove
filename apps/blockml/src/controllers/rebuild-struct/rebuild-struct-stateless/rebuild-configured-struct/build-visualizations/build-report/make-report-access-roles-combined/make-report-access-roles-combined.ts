import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { getSpaceFromFilePath } from '#blockml/functions/get-space-from-file-path/get-space-from-file-path';
import { log } from '#blockml/functions/log/log';
import { makeAccessRolesCombined } from '#common/functions/make-access-roles-combined/make-access-roles-combined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';

let func: Func = 'build-report/make-report-access-roles-combined';

export function makeReportAccessRolesCombined(item: {
  reports: FileReport[];
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileReport[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, 'input.log', input);

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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_reports.log', item.reports);

  return Result.succeed(item.reports);
}
