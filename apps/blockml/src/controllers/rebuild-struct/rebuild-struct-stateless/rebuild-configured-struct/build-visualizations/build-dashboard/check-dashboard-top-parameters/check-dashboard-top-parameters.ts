import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkTopParameters } from '#blockml/functions/check-top-parameters/check-top-parameters';
import { log } from '#blockml/functions/log/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FileStore } from '#common/zod/blockml/internal/file-store';

let func = FuncEnum.CheckDashboardTopParameters;

export function checkDashboardTopParameters(item: {
  dashboards: FileDashboard[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileDashboard[], never> {
  let { cs, ...input } = item;

  let { caller, structId, stores } = input;

  log(cs, caller, func, structId, LogTypeEnum.Input, input);

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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Entities, newDashboards);

  return Result.succeed(newDashboards);
}
