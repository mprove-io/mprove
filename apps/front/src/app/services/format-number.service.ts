import { Injectable } from '@angular/core';
import type { MconfigField } from '#common/types/backend/mconfig-field';
import type { MconfigChart } from '#common/types/blockml/mconfig-chart';

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
