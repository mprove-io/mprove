import { ConfigService } from '@nestjs/config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FileChart } from '#common/interfaces/blockml/internal/file-chart';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
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
