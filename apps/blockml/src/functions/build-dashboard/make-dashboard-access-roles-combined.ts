import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import { getSpaceFromFilePath } from '../extra/get-space-from-file-path';
import { log } from '../extra/log';

let func = FuncEnum.MakeDashboardAccessRolesCombined;

export function makeDashboardAccessRolesCombined(
  item: {
    dashboards: FileDashboard[];
    spaces: FilePartSpace[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  item.dashboards.forEach(dashboard => {
    let space: FilePartSpace | undefined;

    dashboard.space = getSpaceFromFilePath({
      filePath: dashboard.filePath,
      spaces: item.spaces
    });

    space = item.spaces.find(x => x.space === dashboard.space);

    dashboard.accessRolesCombined = [
      ...new Set([
        ...(space?.accessRolesCombined ?? []),
        ...(dashboard.access_roles ?? [])
      ])
    ];
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Ds, item.dashboards);

  return item.dashboards;
}
