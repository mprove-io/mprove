import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { types } from '../../barrels/types';

let func = enums.FuncEnum.CheckChartType;

export function checkChartType<T extends types.dzType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (helper.isUndefined(report.type)) {
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
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
