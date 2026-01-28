import { ConfigService } from '@nestjs/config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { Model } from '#common/interfaces/blockml/model';
import { drcType } from '#common/types/drc-type';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { checkChartData } from './check-chart-data';
import { checkChartDataParameters } from './check-chart-data-parameters';
import { checkChartOptionsParameters } from './check-chart-options-parameters';
import { checkChartOptionsSeriesParameters } from './check-chart-options-series-parameters';
import { checkChartOptionsXAxisParameters } from './check-chart-options-x-axis-parameters';
import { checkChartOptionsYAxisParameters } from './check-chart-options-y-axis-parameters';
import { checkChartPlateParameters } from './check-chart-plate-parameters';
import { checkChartType } from './check-chart-type';

export function buildMconfigChart<T extends drcType>(
  item: {
    entities: T[];
    apiModels: Model[];
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let entities = item.entities;

  if (
    item.caller === CallerEnum.BuildDashboardTileCharts ||
    item.caller === CallerEnum.BuildChartTileCharts
  ) {
    entities = checkChartType(
      {
        entities: entities,
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    );

    entities = checkChartData(
      {
        entities: entities,
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    );

    entities = checkChartDataParameters(
      {
        entities: entities,
        apiModels: item.apiModels,
        stores: item.stores,
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    );

    entities = checkChartPlateParameters(
      {
        entities: entities,
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    );
  }

  entities = checkChartOptionsParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkChartOptionsXAxisParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkChartOptionsYAxisParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkChartOptionsSeriesParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return entities;
}
