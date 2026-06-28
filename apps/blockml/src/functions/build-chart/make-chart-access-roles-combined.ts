import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { makeAccessRolesCombined } from '#common/functions/space/make-access-roles-combined';
import type { FileChart } from '#common/zod/blockml/internal/file-chart';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { Model } from '#common/zod/blockml/model';
import { getSpaceFromFilePath } from '../extra/get-space-from-file-path';
import { log } from '../extra/log';

let func = FuncEnum.MakeChartAccessRolesCombined;

export function makeChartAccessRolesCombined(
  item: {
    charts: FileChart[];
    spaces: FilePartSpace[];
    apiModels: Model[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  item.charts.forEach(chart => {
    let chartSpace: FilePartSpace | undefined;
    let model = item.apiModels.find(x => x.modelId === chart.tiles[0].model);

    chart.space = getSpaceFromFilePath({
      filePath: chart.filePath,
      spaces: item.spaces
    });

    chartSpace = item.spaces.find(x => x.space === chart.space);

    chart.accessRolesCombined = makeAccessRolesCombined({
      accessRoles: chart.access_roles ?? [],
      accessRolesInherited: [
        ...(chartSpace?.accessRolesCombined ?? []),
        ...(model?.accessRolesCombined ?? [])
      ]
    });
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Charts, item.charts);

  return item.charts;
}
