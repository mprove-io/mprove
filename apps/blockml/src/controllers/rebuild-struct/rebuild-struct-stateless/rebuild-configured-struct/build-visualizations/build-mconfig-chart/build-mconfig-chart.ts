import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { drcType } from '#common/types/drc-type';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import { checkChartData } from './check-chart-data/check-chart-data';
import { checkChartDataParameters } from './check-chart-data-parameters/check-chart-data-parameters';
import { checkChartOptionsParameters } from './check-chart-options-parameters/check-chart-options-parameters';
import { checkChartOptionsSeriesParameters } from './check-chart-options-series-parameters/check-chart-options-series-parameters';
import { checkChartOptionsXAxisParameters } from './check-chart-options-x-axis-parameters/check-chart-options-x-axis-parameters';
import { checkChartOptionsYAxisParameters } from './check-chart-options-y-axis-parameters/check-chart-options-y-axis-parameters';
import { checkChartPlateParameters } from './check-chart-plate-parameters/check-chart-plate-parameters';
import { checkChartType } from './check-chart-type/check-chart-type';

export function buildMconfigChart<T extends drcType>(item: {
  entities: T[];
  apiModels: Model[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { entities, apiModels, stores, errors, structId, caller, cs } = item;

  if (
    caller === CallerEnum.BuildDashboardTileCharts ||
    caller === CallerEnum.BuildChartTileCharts
  ) {
    entities = checkChartType(
      {
        entities: entities,
        structId: structId,
        errors: errors,
        caller: caller
      },
      cs
    );

    entities = checkChartData(
      {
        entities: entities,
        structId: structId,
        errors: errors,
        caller: caller
      },
      cs
    );

    entities = checkChartDataParameters(
      {
        entities: entities,
        apiModels: apiModels,
        stores: stores,
        structId: structId,
        errors: errors,
        caller: caller
      },
      cs
    );

    entities = checkChartPlateParameters(
      {
        entities: entities,
        structId: structId,
        errors: errors,
        caller: caller
      },
      cs
    );
  }

  entities = checkChartOptionsParameters(
    {
      entities: entities,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  entities = checkChartOptionsXAxisParameters(
    {
      entities: entities,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  entities = checkChartOptionsYAxisParameters(
    {
      entities: entities,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  entities = checkChartOptionsSeriesParameters(
    {
      entities: entities,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  return Result.succeed(entities);
}
