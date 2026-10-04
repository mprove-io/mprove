import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  BarSeriesOption,
  EChartsInitOpts,
  EChartsOption,
  LineSeriesOption,
  PieSeriesOption,
  ScatterSeriesOption,
  SeriesOption
} from 'echarts';
import { YAXisOption } from 'echarts/types/dist/shared';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MconfigField } from '#common/types/backend/parts/mconfig/mconfig-field';
import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';
import type { ModelType } from '#common/types/blockml/parts/model/model-type';
import type { QueryStatus } from '#common/types/blockml/parts/query/query-status';
import type { TimeSpec } from '#common/types/shared/time/timespec';
import { frontFormatTsUnix } from '#front/app/functions/front-format-ts-unix';
import { getSelectValid } from '#front/app/functions/get-select-valid';
import { StructQuery } from '#front/app/queries/struct.query';
import {
  DataService,
  QDataRow,
  SeriesDataElement
} from '#front/app/services/data.service';
import { FormatNumberService } from '#front/app/services/format-number.service';

@Component({
  standalone: false,
  selector: 'm-chart-view',
  templateUrl: './chart-view.component.html'
})
export class ChartViewComponent implements OnChanges {
  eChartInitOpts: any;
  eChartOptions: EChartsOption;

  eChartsTypes: ChartType[] = ['line', 'bar', 'scatter', 'pie'];

  eChartsMultiChartTypes: ChartType[] = ['line', 'bar', 'scatter'];

  @Input()
  isTableHeaderWide: boolean;

  @Input()
  chartInstanceId: string;

  @Input()
  isAnimation: boolean;

  @Input()
  modelType: ModelType;

  @Input()
  mconfigFields: MconfigField[];

  @Input()
  mconfigTimezone: string;

  yFieldColumn: MconfigField;

  @Input()
  isStoreModel: boolean;

  @Input()
  qData: QDataRow[];

  @Input()
  chart: MconfigChart;

  @Input()
  queryStatus: QueryStatus;

  @Output()
  chartPartChange = new EventEmitter<MconfigChart>();

  echartsInstance: any;

  seriesData: SeriesDataElement[] = [];

  isSelectValid = false;
  errorMessage = '';

  constructor(
    private dataService: DataService,
    private structQuery: StructQuery,
    private formatNumberService: FormatNumberService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.chartViewUpdateChart();
  }

  chartViewUpdateChart() {
    let eChartInitOpts = {
      renderer: 'svg'
    } as EChartsInitOpts;

    let eChartOptions: EChartsOption = {
      animation: this.isAnimation,
      useUTC: true,
      grid: {
        left: 100,
        right:
          this.chart.series.map(x => x.yAxisIndex).filter(yi => yi > 0).length >
          0
            ? 100
            : 50,
        top: 95,
        bottom: 35
      },
      textStyle: {
        fontFamily: 'sans-serif'
      },
      legend:
        this.chart.type === 'pie'
          ? { show: false }
          : {
              top: 20,
              padding: [0, 0, 0, 0],
              textStyle: {
                fontSize: 15,
                fontFamily: "'Montserrat', sans-serif"
              }
            },
      tooltip:
        this.chart.type === 'line' || this.chart.type === 'bar'
          ? {
              confine: true,
              trigger: 'axis',
              order: 'valueDesc',
              valueFormatter: (value: any) =>
                `${isDefined(value) ? value.toFixed(2) : 'Null'}`
            }
          : {
              confine: true,
              trigger: 'item'
            }
    } as EChartsOption;

    let checkSelectResult = getSelectValid({
      chart: this.chart,
      mconfigFields: this.mconfigFields,
      isStoreModel: this.isStoreModel
    });

    this.isSelectValid =
      ['table', 'single', 'pivot_table', ...this.eChartsTypes].indexOf(
        this.chart.type
      ) > -1
        ? checkSelectResult.isSelectValid
        : false;

    this.errorMessage = checkSelectResult.errorMessage;

    if (this.isSelectValid === false) {
      this.seriesData = [];
    } else {
      let xField = isDefined(this.chart.xField)
        ? this.mconfigFields.find(v => v.id === this.chart.xField)
        : undefined;

      if (this.chart.type === 'single' && this.chart.yFields.length > 0) {
        this.yFieldColumn = this.mconfigFields.find(
          y => y.id === this.chart.yFields[0]
        );
      }

      // echarts - data

      if (this.eChartsTypes.indexOf(this.chart.type) > -1) {
        this.seriesData =
          this.qData?.length > 0 &&
          isDefined(this.chart.xField) &&
          isDefined(this.chart.yFields) &&
          this.chart.yFields.length > 0
            ? this.dataService.makeSeriesData({
                modelType: this.modelType,
                mconfigTimezone: this.mconfigTimezone,
                selectFields: this.mconfigFields,
                xFieldId: this.chart.xField,
                sizeFieldId: this.chart.sizeField,
                yFieldsIds: this.chart.yFields,
                multiFieldId: this.chart.multiField,
                data: this.qData,
                chartType: this.chart.type
              })
            : [];
      }

      // echarts - axes

      if (
        this.chart.type === 'line' ||
        this.chart.type === 'bar' ||
        this.chart.type === 'scatter'
      ) {
        let tsFormatter = xField.sqlName.match(/(?:___year)$/g)
          ? (value: any) =>
              frontFormatTsUnix({
                timeSpec: 'years',
                unixTimeZoned: value / 1000
              })
          : xField.sqlName.match(/(?:___quarter)$/g)
            ? (value: any) =>
                frontFormatTsUnix({
                  timeSpec: 'quarters',
                  unixTimeZoned: value / 1000
                })
            : xField.sqlName.match(/(?:___month)$/g)
              ? (value: any) =>
                  frontFormatTsUnix({
                    timeSpec: 'months',
                    unixTimeZoned: value / 1000
                  })
              : xField.sqlName.match(/(?:___week)$/g)
                ? (value: any) =>
                    frontFormatTsUnix({
                      timeSpec: 'weeks',
                      unixTimeZoned: value / 1000
                    })
                : xField.sqlName.match(/(?:___date)$/g)
                  ? (value: any) =>
                      frontFormatTsUnix({
                        timeSpec: 'days',
                        unixTimeZoned: value / 1000
                      })
                  : undefined;

        eChartOptions.xAxis = isDefined(xField.detail)
          ? {
              type: 'time',
              axisLabel: {
                fontSize: 13,
                formatter: (value: any) => {
                  let storeTimeSpec: TimeSpec =
                    xField.detail === 'timestamps'
                      ? 'timestamps'
                      : xField.detail === 'minutes'
                        ? 'minutes'
                        : xField.detail === 'hours'
                          ? 'hours'
                          : xField.detail === 'days'
                            ? 'days'
                            : xField.detail === 'weeksSunday'
                              ? 'weeks'
                              : xField.detail === 'weeksMonday'
                                ? 'weeks'
                                : xField.detail === 'months'
                                  ? 'months'
                                  : xField.detail === 'quarters'
                                    ? 'quarters'
                                    : xField.detail === 'years'
                                      ? 'years'
                                      : undefined;

                  return frontFormatTsUnix({
                    timeSpec: storeTimeSpec,
                    unixTimeZoned: value / 1000
                  });
                }
              }
            }
          : xField.result === 'ts'
            ? {
                type: 'time',
                axisLabel: {
                  fontSize: 13,
                  formatter: tsFormatter
                }
              }
            : xField.result === 'number'
              ? {
                  type: 'value',
                  scale: this.chart.xAxis.scale,
                  axisLabel: {
                    fontSize: 13
                  }
                }
              : {
                  type: 'category',
                  axisLabel: {
                    fontSize: 13
                  }
                };

        let yAxis =
          this.chart.series.map(x => x.yAxisIndex).filter(yi => yi > 0)
            .length === 0
            ? [this.chart.yAxis[0]]
            : this.chart.yAxis;

        eChartOptions.yAxis = yAxis.map(y => {
          let newY: YAXisOption = Object.assign({}, y, <YAXisOption>{
            type: 'value',
            axisLabel: {
              fontSize: 14
            }
          });

          return newY;
        });
      }

      // echarts - series

      if (this.eChartsTypes.indexOf(this.chart.type) > -1) {
        let tooltip = {
          borderWidth: 2,
          textStyle: {
            fontSize: 16
          },
          formatter:
            this.chart.type === 'pie'
              ? (p: any) => {
                  let xValueFmt = isDefined(p.data.pXValueFmt)
                    ? p.data.pXValueFmt
                    : 'null';

                  let sValueFmt = isDefined(p.data.pYValueFmt)
                    ? p.data.pYValueFmt
                    : 'null';

                  return `${xValueFmt}<br/><strong>${sValueFmt}</strong>`;
                }
              : (p: any) => {
                  let xValueFmt = isDefined(p.data.pXValueFmt)
                    ? p.data.pXValueFmt
                    : 'null';

                  let sValueFmt = isDefined(p.data.pYValueFmt)
                    ? p.data.pYValueFmt
                    : 'null';

                  let sizeValueFmt = isDefined(p.data.pSizeValueFmt)
                    ? p.data.pSizeValueFmt
                    : 'null';

                  return this.chart.type === 'scatter' &&
                    isDefined(this.chart.sizeField) &&
                    p.name !== p.data.pSizeFieldName
                    ? `${p.name}: <strong>${sValueFmt}</strong><br/>${p.data.pSizeFieldName}: <strong>${sizeValueFmt}</strong><br/>${xValueFmt}`
                    : `${p.name}<br/><strong>${sValueFmt}</strong><br/>${xValueFmt}`;
                }
        };

        let dataSeries: SeriesOption[] = [];

        this.chart.series
          .sort((a, b) => {
            let sortedIds = this.mconfigFields.map(x => x.id);
            let aIndex = sortedIds.indexOf(a.dataField);
            let bIndex = sortedIds.indexOf(b.dataField);

            return aIndex > bIndex ? 1 : bIndex > aIndex ? -1 : 0;
          })
          .forEach(chartSeriesElement => {
            let seriesDataElements = this.seriesData.filter(
              sd => sd.seriesId === chartSeriesElement.dataField
            );

            seriesDataElements.forEach(seriesDataElement => {
              let lineSeriesOption: LineSeriesOption = {
                type: 'line',
                yAxisIndex: chartSeriesElement.yAxisIndex,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                  width: 2.5
                },
                name: seriesDataElement?.seriesName,
                data: seriesDataElement?.seriesPoints.map(x => ({
                  name: seriesDataElement?.seriesName,
                  value: [x.xValue, x.yValue],
                  pXValueFmt: x.xValueFmt,
                  pYValueFmt: x.yValueFmt
                })),
                tooltip: tooltip,
                emphasis: {
                  disabled: true
                }
              };

              let barSeriesOption: BarSeriesOption = {
                type: 'bar',
                yAxisIndex: chartSeriesElement.yAxisIndex,
                name: seriesDataElement?.seriesName,
                data: seriesDataElement?.seriesPoints.map(x => ({
                  name: seriesDataElement?.seriesName,
                  value: [x.xValue, x.yValue],
                  pXValueFmt: x.xValueFmt,
                  pYValueFmt: x.yValueFmt
                })),
                tooltip: tooltip
              };

              let scatterSeriesOption: ScatterSeriesOption = {
                type: 'scatter',
                yAxisIndex: chartSeriesElement.yAxisIndex,
                symbolSize: isDefined(this.chart.sizeField)
                  ? (data: any) => 5 + data[2] * 25
                  : 10,
                name: seriesDataElement?.seriesName,
                data: seriesDataElement?.seriesPoints.map(x => ({
                  name: seriesDataElement?.seriesName,
                  value: [x.xValue, x.yValue, x.sizeValueMod],
                  pXValueFmt: x.xValueFmt,
                  pYValueFmt: x.yValueFmt,
                  pSizeValue: x.sizeValue,
                  pSizeValueFmt: x.sizeValueFmt,
                  pSizeFieldName: x.sizeFieldName
                })),
                tooltip: tooltip
              };

              let pieSeriesOption: PieSeriesOption = {
                type: 'pie',
                name: seriesDataElement?.seriesName,
                data: seriesDataElement?.seriesPoints.map(x => ({
                  name: x.xValueFmt,
                  value: x.yValue,
                  pXValueFmt: x.xValueFmt,
                  pYValueFmt: x.yValueFmt
                })),
                tooltip: tooltip
              };

              let baseSeriesOption: SeriesOption = {
                type: this.chart.type as any,
                name: seriesDataElement?.seriesName,
                data: seriesDataElement?.seriesPoints.map(x => ({
                  name: seriesDataElement?.seriesName,
                  value: [x.xValue, x.yValue],
                  pXValueFmt: x.xValueFmt,
                  pYValueFmt: x.yValueFmt
                }))
              };

              let seriesOption =
                chartSeriesElement.type === 'line'
                  ? lineSeriesOption
                  : chartSeriesElement.type === 'bar'
                    ? barSeriesOption
                    : chartSeriesElement.type === 'scatter'
                      ? scatterSeriesOption
                      : chartSeriesElement.type === 'pie'
                        ? pieSeriesOption
                        : baseSeriesOption;

              seriesOption.cursor = 'default';

              dataSeries.push(seriesOption);
            });
          });

        eChartOptions.series = dataSeries;
      }
    }

    this.eChartInitOpts = eChartInitOpts;
    this.eChartOptions = eChartOptions;

    this.cd.detectChanges();
  }
}
