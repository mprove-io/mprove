import { Injectable } from '@angular/core';
import { common } from '~front/barrels/common';

@Injectable({ providedIn: 'root' })
export class FormatNumberService {
  constructor() {}

  getFormatNumberDataLabel(item: {
    chart: common.MconfigChart;
    mconfigFields: common.MconfigField[];
  }) {
    let { chart, mconfigFields } = item;

    let field = common.isDefined(chart.yField)
      ? mconfigFields.find(f => f.id === chart.yField)
      : mconfigFields.filter(f => chart.yFields.indexOf(f.id) > -1)[0];

    let formatNumber = chart.formatNumberDataLabel || field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }

  getFormatNumberValue(item: {
    chart: common.MconfigChart;
    mconfigFields: common.MconfigField[];
  }) {
    let { chart, mconfigFields } = item;

    let field =
      chart.type === common.ChartTypeEnum.GaugeLinear
        ? mconfigFields.find(f => f.id === chart.valueField)
        : mconfigFields.find(f => f.id === chart.yField);

    let formatNumber = common.isDefined(chart.formatNumberValue)
      ? chart.formatNumberValue
      : field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }

  getFormatNumberAxisTick(item: {
    chart: common.MconfigChart;
    mconfigFields: common.MconfigField[];
  }) {
    let { chart, mconfigFields } = item;

    let field = mconfigFields.find(f => f.id === chart.yField);

    let formatNumber = chart.formatNumberAxisTick || field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }

  getFormatNumberYAxisTick(item: {
    chart: common.MconfigChart;
    mconfigFields: common.MconfigField[];
  }) {
    let { chart, mconfigFields } = item;

    let field = common.isDefined(chart.yField)
      ? mconfigFields.find(f => f.id === chart.yField)
      : mconfigFields.filter(f => chart.yFields.indexOf(f.id) > -1)[0];

    let formatNumber = chart.formatNumberYAxisTick || field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }

  getFormatNumberXAxisTick(item: {
    chart: common.MconfigChart;
    mconfigFields: common.MconfigField[];
  }) {
    let { chart, mconfigFields } = item;

    let field = mconfigFields.find(f => f.id === chart.yField);

    let formatNumber = chart.formatNumberXAxisTick || field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }
}
