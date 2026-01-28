import { Injectable } from '@angular/core';
import { MconfigField } from '#common/interfaces/backend/mconfig-field';
import { MconfigChart } from '#common/interfaces/blockml/mconfig-chart';

@Injectable({ providedIn: 'root' })
export class FormatNumberService {
  constructor() {}

  getFormatNumberDataLabel(item: {
    chart: MconfigChart;
    mconfigFields: MconfigField[];
  }) {
    let { chart, mconfigFields } = item;

    let field = mconfigFields.filter(f => chart.yFields.indexOf(f.id) > -1)[0];

    let formatNumber = field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }

  getFormatNumberYAxisTick(item: {
    chart: MconfigChart;
    mconfigFields: MconfigField[];
  }) {
    let { chart, mconfigFields } = item;

    let field = mconfigFields.filter(f => chart.yFields.indexOf(f.id) > -1)[0];

    let formatNumber = field?.formatNumber;

    return { field: field, formatNumber: formatNumber };
  }
}
