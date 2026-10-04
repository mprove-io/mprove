import {
  DEFAULT_CHART_SERIES_BAR,
  DEFAULT_CHART_SERIES_LINE,
  DEFAULT_CHART_SERIES_PIE,
  DEFAULT_CHART_SERIES_SCATTER
} from '#common/constants/mconfig-chart';

import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';
import type { MconfigChartSeries } from '#common/types/blockml/parts/mconfig/mconfig-chart-series';

export function setChartSeries<T extends Mconfig>(item: { mconfig: T }) {
  let { mconfig } = item;

  let series = makeCopy(mconfig.chart.series);
  let sortedSeries: MconfigChartSeries[] = [];

  if (mconfig.chart.type !== 'table' && mconfig.chart.type !== 'pivot_table') {
    series = series.filter(
      s => mconfig.chart.yFields.indexOf(s.dataField) > -1
    );

    mconfig.chart.yFields.forEach(y => {
      let seriesElement = series.find(s => s.dataField === y);

      if (isDefined(seriesElement)) {
        sortedSeries.push(seriesElement);
      } else {
        let newSeriesElement: MconfigChartSeries =
          mconfig.chart.type === 'line'
            ? makeCopy(DEFAULT_CHART_SERIES_LINE)
            : mconfig.chart.type === 'bar'
              ? makeCopy(DEFAULT_CHART_SERIES_BAR)
              : mconfig.chart.type === 'scatter'
                ? makeCopy(DEFAULT_CHART_SERIES_SCATTER)
                : mconfig.chart.type === 'pie'
                  ? makeCopy(DEFAULT_CHART_SERIES_PIE)
                  : makeCopy(DEFAULT_CHART_SERIES_LINE);

        newSeriesElement.dataField = y;
        sortedSeries.push(newSeriesElement);
      }
    });

    mconfig.chart = Object.assign({}, mconfig.chart, <MconfigChart>{
      series: sortedSeries
    });
  }

  return mconfig;
}
