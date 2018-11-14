import { Pipe, PipeTransform } from '@angular/core';
import * as api from 'app/api/_index';
import * as enums from 'app/enums/_index';

@Pipe({ name: 'chartIcon' })
export class ChartIconPipe implements PipeTransform {
  transform(chartType: api.ChartTypeEnum) {
    switch (chartType) {
      case api.ChartTypeEnum.Table:
        return enums.ChartIconEnum.Table;
      case api.ChartTypeEnum.BarVertical:
        return enums.ChartIconEnum.BarVertical;
      case api.ChartTypeEnum.BarVerticalGrouped:
        return enums.ChartIconEnum.BarVerticalGrouped;
      case api.ChartTypeEnum.BarVerticalStacked:
        return enums.ChartIconEnum.BarVerticalStacked;
      case api.ChartTypeEnum.BarVerticalNormalized:
        return enums.ChartIconEnum.BarVerticalNormalized;
      case api.ChartTypeEnum.BarHorizontal:
        return enums.ChartIconEnum.BarHorizontal;
      case api.ChartTypeEnum.BarHorizontalGrouped:
        return enums.ChartIconEnum.BarHorizontalGrouped;
      case api.ChartTypeEnum.BarHorizontalStacked:
        return enums.ChartIconEnum.BarHorizontalStacked;
      case api.ChartTypeEnum.BarHorizontalNormalized:
        return enums.ChartIconEnum.BarHorizontalNormalized;
      case api.ChartTypeEnum.Pie:
        return enums.ChartIconEnum.Pie;
      case api.ChartTypeEnum.PieAdvanced:
        return enums.ChartIconEnum.PieAdvanced;
      case api.ChartTypeEnum.PieGrid:
        return enums.ChartIconEnum.PieGrid;
      case api.ChartTypeEnum.Line:
        return enums.ChartIconEnum.Line;
      case api.ChartTypeEnum.Area:
        return enums.ChartIconEnum.Area;
      case api.ChartTypeEnum.AreaStacked:
        return enums.ChartIconEnum.AreaStacked;
      case api.ChartTypeEnum.AreaNormalized:
        return enums.ChartIconEnum.AreaNormalized;
      case api.ChartTypeEnum.HeatMap:
        return enums.ChartIconEnum.HeatMap;
      case api.ChartTypeEnum.TreeMap:
        return enums.ChartIconEnum.TreeMap;
      case api.ChartTypeEnum.NumberCard:
        return enums.ChartIconEnum.NumberCard;
      case api.ChartTypeEnum.Gauge:
        return enums.ChartIconEnum.Gauge;
      case api.ChartTypeEnum.GaugeLinear:
        return enums.ChartIconEnum.GaugeLinear;
      default:
        return enums.ChartIconEnum.Table;
    }
  }
}
