import {
  DEFAULT_CHART_SERIES_BAR,
  DEFAULT_CHART_SERIES_LINE,
  DEFAULT_CHART_SERIES_PIE,
  DEFAULT_CHART_SERIES_SCATTER
} from '#common/constants/mconfig-chart';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { Mconfig } from '#common/interfaces/blockml/mconfig';
import { MconfigChart } from '#common/interfaces/blockml/mconfig-chart';
import { MconfigChartSeries } from '#common/interfaces/blockml/mconfig-chart-series';
import { isDefined } from './is-defined';
import { makeCopy } from './make-copy';

export function setChartSeries<T extends Mconfig>(item: { mconfig: T }) {
  let { mconfig } = item;

  let series = makeCopy(mconfig.chart.series);
  let sortedSeries: MconfigChartSeries[] = [];

  if (mconfig.chart.type !== ChartTypeEnum.Table) {
    series = series.filter(
      s => mconfig.chart.yFields.indexOf(s.dataField) > -1
    );

    mconfig.chart.yFields.forEach(y => {
      let seriesElement = series.find(s => s.dataField === y);

      if (isDefined(seriesElement)) {
        sortedSeries.push(seriesElement);
      } else {
        let newSeriesElement: MconfigChartSeries =
          mconfig.chart.type === ChartTypeEnum.Line
            ? makeCopy(DEFAULT_CHART_SERIES_LINE)
            : mconfig.chart.type === ChartTypeEnum.Bar
              ? makeCopy(DEFAULT_CHART_SERIES_BAR)
              : mconfig.chart.type === ChartTypeEnum.Scatter
                ? makeCopy(DEFAULT_CHART_SERIES_SCATTER)
                : mconfig.chart.type === ChartTypeEnum.Pie
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
