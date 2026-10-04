import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { getSpaceFromFilePath } from '#blockml/functions/get-space-from-file-path/get-space-from-file-path';
import { log } from '#blockml/functions/log/log';
import { makeAccessRolesCombined } from '#common/functions/make-access-roles-combined/make-access-roles-combined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileChart } from '#common/types/blockml/parts/internal/file-chart';
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';

let func: Func = 'build-chart/make-chart-access-roles-combined';

export function makeChartAccessRolesCombined(item: {
  charts: FileChart[];
  spaces: FilePartSpace[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileChart[], never> {
  let { charts, spaces, errors, cs, caller, structId } = item;

  log(cs, caller, func, structId, 'input.log', item);

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

  log(cs, caller, func, structId, 'out_errors.log', errors);

  log(cs, caller, func, structId, 'out_charts.log', charts);

  return Result.succeed(charts);
}
