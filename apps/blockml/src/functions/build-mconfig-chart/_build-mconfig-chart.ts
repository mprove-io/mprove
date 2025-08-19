import { ConfigService } from '@nestjs/config';
import { barMconfigChart } from '~blockml/barrels/bar-mconfig-chart';
import { BmError } from '~blockml/models/bm-error';

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
    entities = barMconfigChart.checkChartType(
      {
        entities: entities,
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    );

    entities = barMconfigChart.checkChartData(
      {
        entities: entities,
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    );

    entities = barMconfigChart.checkChartDataParameters(
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

    entities = barMconfigChart.checkChartPlateParameters(
      {
        entities: entities,
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    );
  }

  entities = barMconfigChart.checkChartOptionsParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barMconfigChart.checkChartOptionsXAxisParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barMconfigChart.checkChartOptionsYAxisParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barMconfigChart.checkChartOptionsSeriesParameters(
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
