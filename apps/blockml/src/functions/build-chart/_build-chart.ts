import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { FileChart } from '~common/interfaces/blockml/internal/file-chart';
import { checkChartAccess } from './check-chart-access';
import { checkChartTilesExist } from './check-chart-tiles-exist';

export function buildChart(
  item: {
    charts: FileChart[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let charts = item.charts;

  charts = checkChartAccess(
    {
      charts: charts,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  charts = checkChartTilesExist(
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
