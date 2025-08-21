import { Injectable } from '@angular/core';
import { MconfigField } from '~common/interfaces/backend/mconfig-field';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';

@Injectable({ providedIn: 'root' })
export class FormatNumberService {
  constructor() {}

  getFormatNumberDataLabel(item: {
    chart: MconfigChart;
    mconfigFields: MconfigField[];
  }) {
    let { chart, mconfigFields } = item;

    let field =
      // isDefined(chart.yField)
      //   ? mconfigFields.find(f => f.id === chart.yField)
      //   :
      mconfigFields.filter(f => chart.yFields.indexOf(f.id) > -1)[0];

    let formatNumber =
      // chart.formatNumberDataLabel ||
      field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }

  // getFormatNumberValue(item: {
  //   chart: MconfigChart;
  //   mconfigFields: MconfigField[];
  // }) {
  //   let { chart, mconfigFields } = item;

  //   let field = mconfigFields.find(f => f.id === chart.yField);

  //   let formatNumber =
  //     // isDefined(chart.formatNumberValue)
  //     //   ? chart.formatNumberValue
  //     //   :
  //     field?.formatNumber;

  //   return { field: field, formatNumber: formatNumber };
  // }

  // getFormatNumberAxisTick(item: {
  //   chart: MconfigChart;
  //   mconfigFields: MconfigField[];
  // }) {
  //   let { chart, mconfigFields } = item;

  //   let field = mconfigFields.find(f => f.id === chart.yField);

  //   let formatNumber =
  //     // chart.formatNumberAxisTick ||
  //     field?.formatNumber;

  //   return { field: field, formatNumber: formatNumber };
  // }

  getFormatNumberYAxisTick(item: {
    chart: MconfigChart;
    mconfigFields: MconfigField[];
  }) {
    let { chart, mconfigFields } = item;

    let field =
      // isDefined(chart.yField)
      //   ? mconfigFields.find(f => f.id === chart.yField)
      //   :
      mconfigFields.filter(f => chart.yFields.indexOf(f.id) > -1)[0];

    let formatNumber =
      // chart.formatNumberYAxisTick ||
      field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }

  // getFormatNumberXAxisTick(item: {
  //   chart: MconfigChart;
  //   mconfigFields: MconfigField[];
  // }) {
  //   let { chart, mconfigFields } = item;

  //   let field = mconfigFields.find(f => f.id === chart.yField);

  //   let formatNumber =
  //     // chart.formatNumberXAxisTick ||
  //     field?.formatNumber;

  //   return { field: field, formatNumber: formatNumber };
  // }
}
