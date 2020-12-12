import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barChart } from '../../barrels/bar-chart';

export function buildChart(item: {
  dashboards: interfaces.Dashboard[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let dashboards = item.dashboards;

  dashboards = barChart.checkChartType({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barChart.checkChartData({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barChart.checkChartDataParameters({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barChart.checkChartAxisParameters({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barChart.checkChartOptionsParameters({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  dashboards = barChart.checkChartTileParameters({
    dashboards: dashboards,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return dashboards;
}
