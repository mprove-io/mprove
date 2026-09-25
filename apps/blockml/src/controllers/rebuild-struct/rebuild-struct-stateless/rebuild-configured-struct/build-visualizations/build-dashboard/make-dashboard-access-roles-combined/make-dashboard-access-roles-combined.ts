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
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';

let func = FuncEnum.MakeDashboardAccessRolesCombined;

export function makeDashboardAccessRolesCombined(item: {
  dashboards: FileDashboard[];
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileDashboard[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, LogTypeEnum.Input, input);

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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Ds, item.dashboards);

  return Result.succeed(item.dashboards);
}
