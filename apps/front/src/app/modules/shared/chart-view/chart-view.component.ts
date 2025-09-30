import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { formatLocale } from 'd3-format';
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
import {
  FORMAT_NUMBER_DECIMAL,
  FORMAT_NUMBER_GROUPING
} from '~common/constants/top-front';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { DetailUnitEnum } from '~common/enums/detail-unit.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { isDefined } from '~common/functions/is-defined';
import { MconfigField } from '~common/interfaces/backend/mconfig-field';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { frontFormatTsUnix } from '~front/app/functions/front-format-ts-unix';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { StructQuery } from '~front/app/queries/struct.query';
import {
  DataService,
  QDataRow,
  SeriesDataElement
} from '~front/app/services/data.service';
import { FormatNumberService } from '~front/app/services/format-number.service';

@Component({
  standalone: false,
  selector: 'm-chart-view',
  templateUrl: './chart-view.component.html'
})
export class ChartViewComponent implements OnChanges {
  chartTypeEnum = ChartTypeEnum;
  queryStatusEnum = QueryStatusEnum;

  eChartInitOpts: any;
  eChartOptions: EChartsOption;

  eChartsTypes = [
    ChartTypeEnum.Line,
    ChartTypeEnum.Bar,
    ChartTypeEnum.Scatter,
    ChartTypeEnum.Pie
  ];

  eChartsMultiChartTypes = [
    ChartTypeEnum.Line,
    ChartTypeEnum.Bar,
    ChartTypeEnum.Scatter
  ];

  @Input()
  isTableHeaderWide: boolean;

  @Input()
  chartInstanceId: string;

  @Input()
  isAnimation: boolean;

  @Input()
  modelType: ModelTypeEnum;

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
  queryStatus: QueryStatusEnum;

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
    // console.log('chart-view ngOnChanges');
    // console.log(changes);
    this.chartViewUpdateChart();
  }

  chartViewUpdateChart() {
    // console.log('this.chart');
    // console.log(this.chart);

    let eChartInitOpts = {
      renderer: 'svg'
      // renderer: 'canvas'
    } as EChartsInitOpts;

    let eChartOptions: EChartsOption = {
      animation: this.isAnimation,
      // transitionDuration: 0,
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
        this.chart.type === ChartTypeEnum.Pie
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
        this.chart.type === ChartTypeEnum.Line ||
        this.chart.type === ChartTypeEnum.Bar
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
      [ChartTypeEnum.Table, ChartTypeEnum.Single, ...this.eChartsTypes].indexOf(
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

      // let yField = isDefined(this.chart.yField)
      //   ? this.mconfigFields.find(v => v.id === this.chart.yField)
      //   : undefined;

      // let sizeField = isDefined(this.chart.sizeField)
      //   ? this.mconfigFields.find(v => v.id === this.chart.sizeField)
      //   : undefined;

      if (
        this.chart.type === ChartTypeEnum.Single &&
        this.chart.yFields.length > 0
      ) {
        this.yFieldColumn = this.mconfigFields.find(
          y => y.id === this.chart.yFields[0]
        );
      }

      // echarts - data

      if (this.eChartsTypes.indexOf(this.chart.type) > -1) {
        // console.log('this.qData');
        // console.log(this.qData);

        //   [
        //     {
        //         "order_items.total_sale_price": {
        //             "name": "order_items_total_sale_price",
        //             "value": 92.9,
        //             "valueFmt": "92.9"
        //         },
        //         "orders.created___hour": {
        //             "name": "orders_created___hour",
        //             "value": "2025-08-05 09",
        //             "valueFmt": "09:00 05 Aug 2025"
        //         }
        //     }
        // ]

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

        // console.log('this.seriesData');
        // console.log(this.seriesData);

        //   [
        //     {
        //         "seriesName": "Order Items Total Sale Price",
        //         "seriesId": "order_items.total_sale_price",
        //         "seriesPoints": [
        //             {
        //                 "xValue": 1754384400000,
        //                 "xValueFmt": "09:00 05 Aug 2025",
        //                 "yValue": 92.9,
        //                 "yValueFmt": "92.9",
        //                 "sizeValueMod": 1
        //             },
        //         ]
        //     }
        // ]
      }

      // echarts - axes

      if (
        this.chart.type === ChartTypeEnum.Line ||
        this.chart.type === ChartTypeEnum.Bar ||
        this.chart.type === ChartTypeEnum.Scatter
      ) {
        let tsFormatter = xField.sqlName.match(/(?:___year)$/g)
          ? (value: any) =>
              frontFormatTsUnix({
                timeSpec: TimeSpecEnum.Years,
                unixTimeZoned: value / 1000
              })
          : xField.sqlName.match(/(?:___quarter)$/g)
            ? (value: any) =>
                frontFormatTsUnix({
                  timeSpec: TimeSpecEnum.Quarters,
                  unixTimeZoned: value / 1000
                })
            : xField.sqlName.match(/(?:___month)$/g)
              ? (value: any) =>
                  frontFormatTsUnix({
                    timeSpec: TimeSpecEnum.Months,
                    unixTimeZoned: value / 1000
                  })
              : xField.sqlName.match(/(?:___week)$/g)
                ? (value: any) =>
                    frontFormatTsUnix({
                      timeSpec: TimeSpecEnum.Weeks,
                      unixTimeZoned: value / 1000
                    })
                : xField.sqlName.match(/(?:___date)$/g)
                  ? (value: any) =>
                      frontFormatTsUnix({
                        timeSpec: TimeSpecEnum.Days,
                        unixTimeZoned: value / 1000
                      })
                  : undefined;

        eChartOptions.xAxis = isDefined(xField.detail)
          ? {
              type: 'time',
              axisLabel: {
                fontSize: 13,
                formatter: (value: any) => {
                  let storeTimeSpec =
                    xField.detail === DetailUnitEnum.Timestamps
                      ? TimeSpecEnum.Timestamps
                      : xField.detail === DetailUnitEnum.Minutes
                        ? TimeSpecEnum.Minutes
                        : xField.detail === DetailUnitEnum.Hours
                          ? TimeSpecEnum.Hours
                          : xField.detail === DetailUnitEnum.Days
                            ? TimeSpecEnum.Days
                            : xField.detail === DetailUnitEnum.WeeksSunday
                              ? TimeSpecEnum.Weeks
                              : xField.detail === DetailUnitEnum.WeeksMonday
                                ? TimeSpecEnum.Weeks
                                : xField.detail === DetailUnitEnum.Months
                                  ? TimeSpecEnum.Months
                                  : xField.detail === DetailUnitEnum.Quarters
                                    ? TimeSpecEnum.Quarters
                                    : xField.detail === DetailUnitEnum.Years
                                      ? TimeSpecEnum.Years
                                      : undefined;

                  return frontFormatTsUnix({
                    timeSpec: storeTimeSpec,
                    unixTimeZoned: value / 1000
                  });
                }
              }
            }
          : xField.result === FieldResultEnum.Ts
            ? {
                type: 'time',
                axisLabel: {
                  fontSize: 13,
                  formatter: tsFormatter
                }
              }
            : xField.result === FieldResultEnum.Number
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
            this.chart.type === ChartTypeEnum.Pie
              ? (p: any) => {
                  // console.log(p);

                  let xValueFmt = isDefined(p.data.pXValueFmt)
                    ? p.data.pXValueFmt
                    : 'null';

                  let sValueFmt = isDefined(p.data.pYValueFmt)
                    ? p.data.pYValueFmt
                    : 'null';

                  return `${xValueFmt}<br/><strong>${sValueFmt}</strong>`;
                }
              : (p: any) => {
                  // console.log(p);

                  let xValueFmt = isDefined(p.data.pXValueFmt)
                    ? p.data.pXValueFmt
                    : 'null';

                  let sValueFmt = isDefined(p.data.pYValueFmt)
                    ? p.data.pYValueFmt
                    : 'null';

                  let sizeValueFmt = isDefined(p.data.pSizeValueFmt)
                    ? p.data.pSizeValueFmt
                    : 'null';

                  return this.chart.type === ChartTypeEnum.Scatter &&
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
                // areaStyle: {},
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
                  // name: x.xValue,
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
                chartSeriesElement.type === ChartTypeEnum.Line
                  ? lineSeriesOption
                  : chartSeriesElement.type === ChartTypeEnum.Bar
                    ? barSeriesOption
                    : chartSeriesElement.type === ChartTypeEnum.Scatter
                      ? scatterSeriesOption
                      : chartSeriesElement.type === ChartTypeEnum.Pie
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

    // console.log('chart-view eChartInitOpts');
    // console.log(eChartInitOpts);

    // console.log('chart-view eChartOptions');
    // console.log(eChartOptions);

    this.cd.detectChanges();
  }

  onSelect(event: any) {}

  dataLabelFormatting(value: any) {
    let { field, formatNumber } =
      this.formatNumberService.getFormatNumberDataLabel({
        chart: this.chart,
        mconfigFields: this.mconfigFields
      });

    let struct = this.structQuery.getValue();

    let locale = formatLocale({
      decimal: FORMAT_NUMBER_DECIMAL,
      thousands: struct.thousandsSeparator,
      grouping: FORMAT_NUMBER_GROUPING,
      currency: [field.currencyPrefix ?? '', field.currencySuffix ?? '']
    });

    //
    if (isDefined(value.value)) {
      value = value.value;
    }

    if (isNaN(value) === true) {
      value = value.split(',').join('');
    }

    if (isNaN(value) === false && isDefined(formatNumber)) {
      value = locale.format(formatNumber)(Number(value));
    }

    return value;
  }

  labelFormatting(value: any) {
    // let {
    //   field,
    //   formatNumber
    // } = this.formatNumberService.getFormatNumberDataLabel({
    //   chart: this.chart,
    //   mconfigFields: this.mconfigFields
    // });

    // let locale = formatLocale({
    //   decimal: FORMAT_NUMBER_DECIMAL,
    //   thousands: struct.thousandsSeparator,
    //   grouping: FORMAT_NUMBER_GROUPING,
    //   currency: [field.currencyPrefix, field.currencySuffix]
    // });

    //
    if (isDefined(value.label)) {
      let num = value.label.split(',').join('');
      if (isNaN(num) === false) {
        value = num;
      } else {
        value = value.label;
      }
    }

    // if (isNaN(value) === true) {
    //   value = value.split(',').join('');
    // }

    // if (isNaN(value) === false && isDefined(formatNumber)) {
    //   value = locale.format(formatNumber)(Number(value));
    // }

    return value;
  }

  // valueFormatting(value: any) {
  //   let { field, formatNumber } = this.formatNumberService.getFormatNumberValue(
  //     {
  //       chart: this.chart,
  //       mconfigFields: this.mconfigFields
  //     }
  //   );

  //   let locale = formatLocale({
  //     decimal: FORMAT_NUMBER_DECIMAL,
  //     thousands: struct.thousandsSeparator,
  //     grouping: FORMAT_NUMBER_GROUPING,
  //     currency: [field.currencyPrefix, field.currencySuffix]
  //   });

  //   // ngx-charts-number-card passes data instead of value
  //   if (isDefined(value.value)) {
  //     value = value.value;
  //   }

  //   if (isNaN(value) === true) {
  //     value = value.split(',').join('');
  //   }

  //   if (isNaN(value) === false && isDefined(formatNumber)) {
  //     value = locale.format(formatNumber)(Number(value));
  //   }

  //   return value;
  // }

  // axisTickFormatting(value: any) {
  //   let { field, formatNumber } =
  //     this.formatNumberService.getFormatNumberAxisTick({
  //       chart: this.chart,
  //       mconfigFields: this.mconfigFields
  //     });

  //   let locale = formatLocale({
  //     decimal: FORMAT_NUMBER_DECIMAL,
  //     thousands: struct.thousandsSeparator,
  //     grouping: FORMAT_NUMBER_GROUPING,
  //     currency: [field.currencyPrefix, field.currencySuffix]
  //   });

  //   // ngx-charts-gauge passes string with commas instead of number
  //   if (isNaN(value) === true) {
  //     value = value.split(',').join('');
  //   }

  //   if (isNaN(value) === false && isDefined(formatNumber)) {
  //     value = locale.format(formatNumber)(Number(value));
  //   }

  //   return value;
  // }

  yAxisTickFormatting(value: any) {
    let { field, formatNumber } =
      this.formatNumberService.getFormatNumberYAxisTick({
        chart: this.chart,
        mconfigFields: this.mconfigFields
      });

    let struct = this.structQuery.getValue();

    let locale = formatLocale({
      decimal: FORMAT_NUMBER_DECIMAL,
      thousands: struct.thousandsSeparator,
      grouping: FORMAT_NUMBER_GROUPING,
      currency: [field.currencyPrefix ?? '', field.currencySuffix ?? '']
    });

    // ngx charts horizontal passes data instead of value
    if (isDefined(value.value)) {
      value = value.value;
    }

    if (isNaN(value) === false && isDefined(formatNumber)) {
      value = locale.format(formatNumber)(Number(value));
    }

    return value;
  }

  // xAxisTickFormatting(value: any) {
  //   let { field, formatNumber } =
  //     this.formatNumberService.getFormatNumberXAxisTick({
  //       chart: this.chart,
  //       mconfigFields: this.mconfigFields
  //     });

  //   let locale = formatLocale({
  //     decimal: FORMAT_NUMBER_DECIMAL,
  //     thousands: struct.thousandsSeparator,
  //     grouping: FORMAT_NUMBER_GROUPING,
  //     currency: [field.currencyPrefix, field.currencySuffix]
  //   });

  //   if (isDefined(value.value)) {
  //     value = value.value;
  //   }

  //   if (isNaN(value) === false && isDefined(formatNumber)) {
  //     value = locale.format(formatNumber)(Number(value));
  //   }

  //   return value;
  // }
}

//
//
//

// timeline = CHART_DEFAULT_TIMELINE;
// rangeFillOpacity = CHART_DEFAULT_RANGE_FILL_OPACITY;
// legendForHeatMap = false;

// labelFormattingFn = this.labelFormatting.bind(this);
// dataLabelFormattingFn = this.dataLabelFormatting.bind(this);
// valueFormattingFn = this.valueFormatting.bind(this);
// axisTickFormattingFn = this.axisTickFormatting.bind(this);
// yAxisTickFormattingFn = this.yAxisTickFormatting.bind(this);
// xAxisTickFormattingFn = this.xAxisTickFormatting.bind(this);

// xAxisTickFormattingForLinearFn = this.xAxisTickFormattingForLinear.bind(this);

// dataLabelFormattingFn = (value: any) => this.dataLabelFormatting(value);
// valueFormattingFn = (value: any) => this.valueFormatting(value);
// axisTickFormattingFn = (value: any) => this.axisTickFormatting(value);
// yAxisTickFormattingFn = (value: any) => this.yAxisTickFormatting(value);
// xAxisTickFormattingFn = (value: any) => this.xAxisTickFormatting(value);
// xAxisTickFormattingForLinearFn = (value: any) => this.xAxisTickFormattingForLinear(value);
