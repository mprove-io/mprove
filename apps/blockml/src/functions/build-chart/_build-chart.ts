import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { FileChart } from '#common/zod/blockml/internal/file-chart';
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
