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
import type { FileChart } from '#common/zod/blockml/internal/file-chart';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';

let func = FuncEnum.MakeChartAccessRolesCombined;

export function makeChartAccessRolesCombined(item: {
  charts: FileChart[];
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileChart[], never> {
  let { charts, spaces, errors, cs, caller, structId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  charts.forEach(chart => {
    chart.space = getSpaceFromFilePath({
      filePath: chart.filePath,
      spaces: spaces
    });

    let chartSpace: FilePartSpace = spaces.find(x => x.space === chart.space);

    chart.accessRolesCombined = makeAccessRolesCombined({
      accessRoles: chart.access_roles ?? [],
      accessRolesInherited: chartSpace?.accessRolesCombined ?? []
    });
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, errors);

  log(cs, caller, func, structId, LogTypeEnum.Charts, charts);

  return Result.succeed(charts);
}
