import { ConfigService } from '@nestjs/config';
import { barMconfigChart } from '~blockml/barrels/bar-mconfig-chart';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

export function buildMconfigChart<T extends types.dcrType>(
  item: {
    entities: T[];
    models: common.FileModel[];
    apiModels: common.Model[];
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let entities = item.entities;

  if (
    item.caller === common.CallerEnum.BuildDashboardTileCharts ||
    item.caller === common.CallerEnum.BuildChartTileCharts
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
        models: item.models,
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
