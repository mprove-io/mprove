import {
  DEFAULT_CHART_SERIES_BAR,
  DEFAULT_CHART_SERIES_LINE,
  DEFAULT_CHART_SERIES_PIE,
  DEFAULT_CHART_SERIES_SCATTER,
  Mconfig,
  MconfigChart,
  MconfigChartSeries,
  isDefined,
  makeCopy
} from '~common/_index';
import { enums } from '~common/barrels/enums';

export function setChartSeries<T extends Mconfig>(item: { mconfig: T }) {
  let { mconfig } = item;

  let series = makeCopy(mconfig.chart.series);
  let sortedSeries: MconfigChartSeries[] = [];

  if (mconfig.chart.type !== enums.ChartTypeEnum.Table) {
    series = series.filter(
      s => mconfig.chart.yFields.indexOf(s.dataField) > -1
    );

    mconfig.chart.yFields.forEach(y => {
      let seriesElement = series.find(s => s.dataField === y);

      if (isDefined(seriesElement)) {
        sortedSeries.push(seriesElement);
      } else {
        let newSeriesElement: MconfigChartSeries =
          mconfig.chart.type === enums.ChartTypeEnum.Line
            ? makeCopy(DEFAULT_CHART_SERIES_LINE)
            : mconfig.chart.type === enums.ChartTypeEnum.Bar
              ? makeCopy(DEFAULT_CHART_SERIES_BAR)
              : mconfig.chart.type === enums.ChartTypeEnum.Scatter
                ? makeCopy(DEFAULT_CHART_SERIES_SCATTER)
                : mconfig.chart.type === enums.ChartTypeEnum.Pie
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
