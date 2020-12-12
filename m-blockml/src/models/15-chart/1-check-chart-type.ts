import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.CheckChartType;

export function checkChartType(item: {
  dashboards: interfaces.Dashboard[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newDashboards: interfaces.Dashboard[] = [];

  item.dashboards.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (helper.isUndefined(report.type)) {
        // error e175
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.REPORT_MISSING_TYPE,
            message: `report must have "${enums.ParameterEnum.Type}" parameter`,
            lines: [
              {
                line: report.title_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        [
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
          api.ChartTypeEnum.TreeMap
        ].indexOf(report.type) < 0
      ) {
        // error e171
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.REPORT_WRONG_TYPE,
            message: `value "${report.type}" is not valid "${enums.ParameterEnum.Type}"`,
            lines: [
              {
                line: report.type_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
    });

    if (errorsOnStart === item.errors.length) {
      newDashboards.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
