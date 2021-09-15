import { Injectable } from '@angular/core';
import { common } from '~front/barrels/common';
import { ColumnField } from '../queries/mq.query';

@Injectable({ providedIn: 'root' })
export class FormatNumberService {
  constructor() {}

  getFormatNumberDataLabel(item: {
    chart: common.Chart;
    sortedColumns: ColumnField[];
  }) {
    let { chart, sortedColumns } = item;

    let field = common.isDefined(chart.yField)
      ? sortedColumns.find(f => f.id === chart.yField)
      : sortedColumns.filter(f => chart.yFields.indexOf(f.id) > -1)[0];

    let formatNumber = chart.formatNumberDataLabel || field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }

  getFormatNumberValue(item: {
    chart: common.Chart;
    sortedColumns: ColumnField[];
  }) {
    let { chart, sortedColumns } = item;

    let field =
      chart.type === common.ChartTypeEnum.GaugeLinear
        ? sortedColumns.find(f => f.id === chart.valueField)
        : sortedColumns.find(f => f.id === chart.yField);

    let formatNumber = chart.formatNumberValue || field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }

  getFormatNumberAxisTick(item: {
    chart: common.Chart;
    sortedColumns: ColumnField[];
  }) {
    let { chart, sortedColumns } = item;

    let field = sortedColumns.find(f => f.id === chart.yField);

    let formatNumber = chart.formatNumberAxisTick || field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }

  getFormatNumberYAxisTick(item: {
    chart: common.Chart;
    sortedColumns: ColumnField[];
  }) {
    let { chart, sortedColumns } = item;

    let field = common.isDefined(chart.yField)
      ? sortedColumns.find(f => f.id === chart.yField)
      : sortedColumns.filter(f => chart.yFields.indexOf(f.id) > -1)[0];

    let formatNumber = chart.formatNumberYAxisTick || field?.formatNumber;

    // console.log('getFormatNumberYAxisTick');
    // console.log(formatNumber);

    return { field: field, formatNumber: formatNumber };
  }

  getFormatNumberXAxisTick(item: {
    chart: common.Chart;
    sortedColumns: ColumnField[];
  }) {
    let { chart, sortedColumns } = item;

    // console.log('getFormatNumberXAxisTick - sortedColumns');
    // console.log(sortedColumns);

    let field =
      chart.type === common.ChartTypeEnum.BarHorizontal ||
      chart.type === common.ChartTypeEnum.BarHorizontalGrouped ||
      chart.type === common.ChartTypeEnum.BarHorizontalStacked ||
      chart.type === common.ChartTypeEnum.BarHorizontalNormalized
        ? sortedColumns.find(f => f.id === chart.yField)
        : sortedColumns.find(f => f.id === chart.xField);

    // console.log('getFormatNumberXAxisTick - field');
    // console.log(field);

    let formatNumber = chart.formatNumberXAxisTick || field?.formatNumber;

    // console.log('getFormatNumberXAxisTick - formatNumber');
    // console.log(formatNumber);

    return { field: field, formatNumber: formatNumber };
  }
}
