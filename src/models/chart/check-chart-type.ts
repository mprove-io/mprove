import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function checkChartType(item: { dashboards: interfaces.Dashboard[] }) {

  item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {

      if (typeof report.type === 'undefined' || report.type === null) {
        // error e175
        ErrorsCollector.addError(new AmError({
          title: `missing report 'type'`,
          message: `report must have 'type' parameter`,
          lines: [{
            line: report.title_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }

      if ([
        api.ChartTypeEnum.Area,
        api.ChartTypeEnum.AreaNormalized,
        api.ChartTypeEnum.AreaStacked,
        api.ChartTypeEnum.BarHorizontal,
        api.ChartTypeEnum.BarHorizontalGrouped,
        api.ChartTypeEnum.BarHorizontalNormalized,
        api.ChartTypeEnum.BarHorizontalStacked,
        api.ChartTypeEnum.BarVertical,
        api.ChartTypeEnum.BarVerticalGrouped,
        api.ChartTypeEnum.BarVerticalNormalized,
        api.ChartTypeEnum.BarVerticalStacked,
        api.ChartTypeEnum.Gauge,
        api.ChartTypeEnum.GaugeLinear,
        api.ChartTypeEnum.HeatMap,
        api.ChartTypeEnum.Line,
        api.ChartTypeEnum.NumberCard,
        api.ChartTypeEnum.Pie,
        api.ChartTypeEnum.PieAdvanced,
        api.ChartTypeEnum.PieGrid,
        api.ChartTypeEnum.Table,
        api.ChartTypeEnum.TreeMap,
      ].indexOf(report.type) < 0) {
        // error e171
        ErrorsCollector.addError(new AmError({
          title: `wrong report 'type'`,
          message: `'type' value "${report.type}" is not valid`,
          lines: [{
            line: report.type_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
