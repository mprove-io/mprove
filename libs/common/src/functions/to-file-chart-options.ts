import {
  DEFAULT_CHART,
  DEFAULT_CHART_X_AXIS,
  DEFAULT_CHART_Y_AXIS
} from '~common/constants/mconfig-chart';
import { UI_CHART_TYPES } from '~common/constants/ui-chart-types';
import { FileChartOptions } from '~common/interfaces/blockml/internal/file-chart-options';
import { FileChartOptionsSeriesElement } from '~common/interfaces/blockml/internal/file-chart-options-series';
import { FileChartOptionsXAxisElement } from '~common/interfaces/blockml/internal/file-chart-options-x-axis';
import { FileChartOptionsYAxisElement } from '~common/interfaces/blockml/internal/file-chart-options-y-axis';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { isDefined } from './is-defined';

export function toFileChartOptions(item: {
  chart: MconfigChart;
  isReport: boolean;
}): FileChartOptions {
  let { chart, isReport } = item;

  let options: FileChartOptions = {};

  if (isReport === false) {
    options.format =
      UI_CHART_TYPES.format.indexOf(chart.type) > -1 &&
      chart.format !== DEFAULT_CHART.format &&
      isDefined(chart.format)
        ? (chart.format as unknown as string)
        : undefined;

    options.page_size =
      UI_CHART_TYPES.pageSize.indexOf(chart.type) > -1 &&
      chart.pageSize !== DEFAULT_CHART.pageSize &&
      isDefined(chart.pageSize)
        ? (chart.pageSize as unknown as string)
        : undefined;
  }

  // series

  let partSeries: FileChartOptionsSeriesElement[] = [];

  if (
    UI_CHART_TYPES.seriesGroup.indexOf(chart.type) > -1 &&
    isDefined(chart.series)
  ) {
    // console.log('chart.series');
    // console.log(chart.series);

    chart.series.forEach(chartSeriesElement => {
      // let defaultSeries =
      //   chartSeriesElement.type === ChartTypeEnum.Line
      //     ? DEFAULT_CHART_SERIES_LINE
      //     : chartSeriesElement.type === ChartTypeEnum.Bar
      //     ? DEFAULT_CHART_SERIES_BAR
      //     : chartSeriesElement.type === ChartTypeEnum.Scatter
      //     ? DEFAULT_CHART_SERIES_SCATTER
      //     : chartSeriesElement.type === ChartTypeEnum.Pie
      //     ? DEFAULT_CHART_SERIES_PIE
      //     : DEFAULT_CHART_SERIES_LINE;

      let partSeriesElement: FileChartOptionsSeriesElement = {};

      if (isReport === true) {
        partSeriesElement.data_row_id = chartSeriesElement.dataRowId;
      } else {
        partSeriesElement.data_field = chartSeriesElement.dataField;
      }

      let keepSeriesElement = false;

      if (
        isDefined(chartSeriesElement.type) &&
        chartSeriesElement.type !== chart.type
      ) {
        partSeriesElement.type = chartSeriesElement.type;
        keepSeriesElement = true;
      }

      if (
        isDefined(chartSeriesElement.yAxisIndex) &&
        chartSeriesElement.yAxisIndex !== 0
      ) {
        partSeriesElement.y_axis_index =
          chartSeriesElement.yAxisIndex as unknown as string;
        keepSeriesElement = true;
      }

      if (keepSeriesElement === true) {
        partSeries.push(partSeriesElement);
      }
    });

    if (partSeries.length === 0) {
      partSeries = undefined;
    }
  } else {
    partSeries = undefined;
  }

  options.series = partSeries;

  // x_axis

  let partXAxis: FileChartOptionsXAxisElement =
    {} as FileChartOptionsXAxisElement;

  if (UI_CHART_TYPES.xAxisGroup.indexOf(chart.type) > -1) {
    let keepXAxis = false;

    if (
      isDefined(chart.xAxis.scale) &&
      chart.xAxis.scale !== DEFAULT_CHART_X_AXIS.scale
    ) {
      partXAxis.scale = chart.xAxis.scale as unknown as string;
      keepXAxis = true;
    }

    if (keepXAxis === true) {
      options.x_axis = partXAxis;
    } else {
      partXAxis = undefined;
    }
  } else {
    partXAxis = undefined;
  }

  // y_axis

  let partYAxis: FileChartOptionsYAxisElement[] = [];

  let isFirstYAxisDefault = true;

  if (UI_CHART_TYPES.yAxisGroup.indexOf(chart.type) > -1) {
    if (isDefined(chart.yAxis)) {
      chart.yAxis.forEach((chartYAxisElement, i) => {
        if (i === 0) {
          if (
            isDefined(chartYAxisElement.scale) &&
            chartYAxisElement.scale !== DEFAULT_CHART_Y_AXIS.scale
          ) {
            isFirstYAxisDefault = false;
          }
        }

        let partYAxisElement: FileChartOptionsYAxisElement = {
          scale: isDefined(chartYAxisElement.scale)
            ? (chartYAxisElement.scale as unknown as string)
            : (DEFAULT_CHART_Y_AXIS.scale as unknown as string)
        };

        // if (
        //   isDefined(chartYAxisElement.name) &&
        //   chartYAxisElement.name !== DEFAULT_CHART_Y_AXIS.name
        // ) {
        //   yAxisElement.name = chartYAxisElement.name;
        // }

        partYAxis.push(partYAxisElement);
      });
    } else {
      let defaultChartYAxis: FileChartOptionsYAxisElement = {
        scale: DEFAULT_CHART_Y_AXIS.scale as unknown as string
      };

      partYAxis = [defaultChartYAxis, defaultChartYAxis];
    }

    if (chart.series.map(s => s.yAxisIndex).filter(yi => yi > 0).length === 0) {
      partYAxis = [partYAxis[0]];
    }
  } else {
    partYAxis = undefined;
  }

  if (partYAxis?.length === 1 && isFirstYAxisDefault === true) {
    partYAxis = undefined;
  }

  options.y_axis = partYAxis;

  return options;
}
