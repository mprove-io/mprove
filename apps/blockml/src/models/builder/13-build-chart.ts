import { ConfigService } from '@nestjs/config';
import { barChart } from '~blockml/barrels/bar-chart';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildChart(
  item: {
    vizs: common.FileChart[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let vizs = item.vizs;

  vizs = barChart.checkChartAccess(
    {
      vizs: vizs,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  vizs = barChart.checkChartTilesExist(
    {
      vizs: vizs,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return vizs;
}
