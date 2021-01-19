import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { barChart } from '../../barrels/bar-chart';
import { types } from '../../barrels/types';
import { ConfigService } from '@nestjs/config';

export function buildChart<T extends types.dzType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
  cs: ConfigService;
}) {
  let entities = item.entities;

  entities = barChart.checkChartType({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barChart.checkChartData({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barChart.checkChartDataParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barChart.checkChartAxisParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barChart.checkChartOptionsParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barChart.checkChartTileParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  return entities;
}
