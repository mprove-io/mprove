import { ConfigService } from '@nestjs/config';
import { barChart } from '~blockml/barrels/bar-chart';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildChart(
  item: {
    charts: common.FileChart[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let charts = item.charts;

  charts = barChart.checkChartAccess(
    {
      charts: charts,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  charts = barChart.checkChartTilesExist(
    {
      charts: charts,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return charts;
}
