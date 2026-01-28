import {
  DEFAULT_CHART,
  DEFAULT_CHART_Y_AXIS
} from '#common/constants/mconfig-chart';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeCopy } from '#common/functions/make-copy';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string';
import { FileChartData } from '#common/interfaces/blockml/internal/file-chart-data';
import { FileChartOptions } from '#common/interfaces/blockml/internal/file-chart-options';
import { MconfigChart } from '#common/interfaces/blockml/mconfig-chart';
import { MconfigChartSeries } from '#common/interfaces/blockml/mconfig-chart-series';
import { MconfigChartXAxis } from '#common/interfaces/blockml/mconfig-chart-x-axis';
import { MconfigChartYAxis } from '#common/interfaces/blockml/mconfig-chart-y-axis';

export function wrapMconfigChart(item: {
  title: string;
  type: ChartTypeEnum;
  options: FileChartOptions;
  data: FileChartData;
  isReport: boolean;
  rowIdsWithShowChart: string[];
}) {
  let { title, type, options, data, rowIdsWithShowChart, isReport } = item;

  let xAxis: MconfigChartXAxis = {
    scale: isDefined(options?.x_axis?.scale)
      ? toBooleanFromLowercaseString(options?.x_axis?.scale)
      : DEFAULT_CHART.xAxis.scale
  };

  let yAxis: MconfigChartYAxis[] = [];

  if (isDefined(options?.y_axis) && options?.y_axis.length > 0) {
    yAxis = options?.y_axis.map(yAxisPart => {
      let yAxisElement = {
        scale: isDefined(yAxisPart.scale)
          ? toBooleanFromLowercaseString(yAxisPart.scale)
          : DEFAULT_CHART_Y_AXIS.scale
      };

      return yAxisElement;
    });
  } else {
    yAxis = [makeCopy(DEFAULT_CHART_Y_AXIS)];
  }

  if (yAxis.length === 1) {
    yAxis = [...yAxis, makeCopy(DEFAULT_CHART_Y_AXIS)];
  }

  let series: MconfigChartSeries[] = [];

  let seriesIds =
    isReport === false && isDefined(data?.y_fields)
      ? data?.y_fields
      : isReport === true && isDefined(rowIdsWithShowChart)
        ? rowIdsWithShowChart
        : [];

  series = seriesIds.map(seriesId => {
    let seriesPart = options?.series?.find(s =>
      isReport === false
        ? s.data_field === seriesId
        : s.data_row_id === seriesId
    );

    let seriesElement: MconfigChartSeries = {
      dataField: isReport === false ? seriesId : undefined,
      dataRowId: isReport === true ? seriesId : undefined,
      type: isDefined(seriesPart?.type) ? seriesPart.type : type,
      yAxisIndex: isDefined(seriesPart?.y_axis_index)
        ? Number(seriesPart.y_axis_index)
        : 0
    };

    return seriesElement;
  });

  let mconfigChart: MconfigChart = {
    isValid: true,
    title: title,
    type: type,

    // data
    xField: data?.x_field,
    yFields: data?.y_fields || [],
    multiField: data?.multi_field,

    // options
    format: isDefined(options?.format)
      ? toBooleanFromLowercaseString(options?.format)
      : DEFAULT_CHART.format,
    xAxis: xAxis,
    yAxis: yAxis,
    series: series
  };

  return mconfigChart;
}
