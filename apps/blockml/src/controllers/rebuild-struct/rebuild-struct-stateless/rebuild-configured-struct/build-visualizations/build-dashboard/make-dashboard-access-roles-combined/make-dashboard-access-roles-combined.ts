import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { getSpaceFromFilePath } from '#blockml/functions/get-space-from-file-path/get-space-from-file-path';
import { log } from '#blockml/functions/log/log';
import { makeAccessRolesCombined } from '#common/functions/make-access-roles-combined/make-access-roles-combined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';

let func: Func = 'build-dashboard/make-dashboard-access-roles-combined';

export function makeDashboardAccessRolesCombined(item: {
  dashboards: FileDashboard[];
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileDashboard[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, 'input.log', input);

  item.dashboards.forEach(dashboard => {
    dashboard.space = getSpaceFromFilePath({
      filePath: dashboard.filePath,
      spaces: item.spaces
    });

    let space: FilePartSpace = item.spaces.find(
      x => x.space === dashboard.space
    );

    dashboard.accessRolesCombined = makeAccessRolesCombined({
      accessRoles: dashboard.access_roles ?? [],
      accessRolesInherited: space?.accessRolesCombined ?? []
    });
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_dashboards.log', item.dashboards);

  return Result.succeed(item.dashboards);
}
