import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { barChart } from '../../barrels/bar-chart';
import { types } from '../../barrels/types';

export function buildChart<T extends types.vdType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let entities = item.entities;

  entities = barChart.checkChartType({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barChart.checkChartData({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barChart.checkChartDataParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barChart.checkChartAxisParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barChart.checkChartOptionsParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barChart.checkChartTileParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return entities;
}
