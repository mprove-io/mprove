import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import type { FileChart } from '#common/zod/blockml/internal/file-chart';
import { checkChartAccess } from './check-chart-access/check-chart-access';
import { checkChartTilesExist } from './check-chart-tiles-exist/check-chart-tiles-exist';

export function buildChart(item: {
  charts: FileChart[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileChart[], never> {
  let { charts, errors, structId, caller, cs } = item;

  charts = checkChartAccess(
    {
      charts: charts,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  charts = checkChartTilesExist(
    {
      charts: charts,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  return Result.succeed(charts);
}
