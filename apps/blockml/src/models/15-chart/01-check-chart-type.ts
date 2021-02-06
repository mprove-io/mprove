import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckChartType;

export function checkChartType<T extends types.dzType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

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
          apiToBlockml.ChartTypeEnum.Area,
          apiToBlockml.ChartTypeEnum.AreaNormalized,
          apiToBlockml.ChartTypeEnum.AreaStacked,
          apiToBlockml.ChartTypeEnum.BarHorizontal,
          apiToBlockml.ChartTypeEnum.BarHorizontalGrouped,
          apiToBlockml.ChartTypeEnum.BarHorizontalNormalized,
          apiToBlockml.ChartTypeEnum.BarHorizontalStacked,
          apiToBlockml.ChartTypeEnum.BarVertical,
          apiToBlockml.ChartTypeEnum.BarVerticalGrouped,
          apiToBlockml.ChartTypeEnum.BarVerticalNormalized,
          apiToBlockml.ChartTypeEnum.BarVerticalStacked,
          apiToBlockml.ChartTypeEnum.Gauge,
          apiToBlockml.ChartTypeEnum.GaugeLinear,
          apiToBlockml.ChartTypeEnum.HeatMap,
          apiToBlockml.ChartTypeEnum.Line,
          apiToBlockml.ChartTypeEnum.NumberCard,
          apiToBlockml.ChartTypeEnum.Pie,
          apiToBlockml.ChartTypeEnum.PieAdvanced,
          apiToBlockml.ChartTypeEnum.PieGrid,
          apiToBlockml.ChartTypeEnum.Table,
          apiToBlockml.ChartTypeEnum.TreeMap
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
