import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import { log } from '../extra/log';

let func = FuncEnum.CheckDashboardSpaces;

export function checkDashboardSpaces(
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

    if (isDefined(dashboard.space)) {
      space = item.spaces.find(x => x.space === dashboard.space);

      if (isDefined(space) === false) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.SPACE_DOES_NOT_EXIST,
            message: `${ParameterEnum.Dashboard} "${dashboard.name}" references space "${dashboard.space}" that does not exist`,
            lines: [
              {
                line: dashboard.space_line_num,
                name: dashboard.fileName,
                path: dashboard.filePath
              }
            ]
          })
        );
      }
    }

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
