import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkTopParameters } from '#blockml/functions/check-top-parameters/check-top-parameters';
import { log } from '#blockml/functions/log/log';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';

let func: Func = 'build-dashboard/check-dashboard-top-parameters';

export function checkDashboardTopParameters(item: {
  dashboards: FileDashboard[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileDashboard[], never> {
  let { cs, ...input } = item;

  let { caller, structId, stores } = input;

  log(cs, caller, func, structId, 'input.log', input);

  let newDashboards: FileDashboard[] = [];

  item.dashboards.forEach(x => {
    let errorsOnStart = item.errors.length;

    checkTopParameters(
      {
        fields: x.fields,
        stores: stores,
        parametersLineNum: x.parameters_line_num,
        fileName: x.fileName,
        filePath: x.filePath,
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    );

    if (errorsOnStart === item.errors.length) {
      newDashboards.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newDashboards);

  return Result.succeed(newDashboards);
}
