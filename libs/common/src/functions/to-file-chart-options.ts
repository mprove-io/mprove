import {
  FileChartOptions,
  FileChartOptionsSeriesElement,
  FileChartOptionsXAxisElement,
  FileChartOptionsYAxisElement,
  MconfigChart,
  isDefined
} from '~common/_index';
import { constants } from '~common/barrels/constants';

export function toFileChartOptions(item: {
  chart: MconfigChart;
  isReport: boolean;
}): FileChartOptions {
  let { chart, isReport } = item;

  let options: FileChartOptions = {};

  if (isReport === false) {
    options.format =
      constants.UI_CHART_TYPES.format.indexOf(chart.type) > -1 &&
      chart.format !== constants.DEFAULT_CHART.format &&
      isDefined(chart.format)
        ? (chart.format as unknown as string)
        : undefined;

    options.page_size =
      constants.UI_CHART_TYPES.pageSize.indexOf(chart.type) > -1 &&
      chart.pageSize !== constants.DEFAULT_CHART.pageSize &&
      isDefined(chart.pageSize)
        ? (chart.pageSize as unknown as string)
        : undefined;
  }

  // series

  let partSeries: FileChartOptionsSeriesElement[] = [];

  if (
    constants.UI_CHART_TYPES.seriesGroup.indexOf(chart.type) > -1 &&
    isDefined(chart.series)
  ) {
    // console.log('chart.series');
    // console.log(chart.series);

    chart.series.forEach(chartSeriesElement => {
      // let defaultSeries =
      //   chartSeriesElement.type === ChartTypeEnum.Line
      //     ? constants.DEFAULT_CHART_SERIES_LINE
      //     : chartSeriesElement.type === ChartTypeEnum.Bar
      //     ? constants.DEFAULT_CHART_SERIES_BAR
      //     : chartSeriesElement.type === ChartTypeEnum.Scatter
      //     ? constants.DEFAULT_CHART_SERIES_SCATTER
      //     : chartSeriesElement.type === ChartTypeEnum.Pie
      //     ? constants.DEFAULT_CHART_SERIES_PIE
      //     : constants.DEFAULT_CHART_SERIES_LINE;

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

  if (constants.UI_CHART_TYPES.xAxisGroup.indexOf(chart.type) > -1) {
    let keepXAxis = false;

    if (
      isDefined(chart.xAxis.scale) &&
      chart.xAxis.scale !== constants.DEFAULT_CHART_X_AXIS.scale
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

  if (constants.UI_CHART_TYPES.yAxisGroup.indexOf(chart.type) > -1) {
    if (isDefined(chart.yAxis)) {
      chart.yAxis.forEach((chartYAxisElement, i) => {
        if (i === 0) {
          if (
            isDefined(chartYAxisElement.scale) &&
            chartYAxisElement.scale !== constants.DEFAULT_CHART_Y_AXIS.scale
          ) {
            isFirstYAxisDefault = false;
          }
        }

        let partYAxisElement: FileChartOptionsYAxisElement = {
          scale: isDefined(chartYAxisElement.scale)
            ? (chartYAxisElement.scale as unknown as string)
            : (constants.DEFAULT_CHART_Y_AXIS.scale as unknown as string)
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
        scale: constants.DEFAULT_CHART_Y_AXIS.scale as unknown as string
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
