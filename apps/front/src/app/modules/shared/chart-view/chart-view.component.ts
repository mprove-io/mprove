import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { LegendPosition } from '@swimlane/ngx-charts';
import {
  AgBubbleSeriesOptions,
  AgCartesianChartOptions,
  AgChartOptions,
  AgDonutSeriesOptions,
  AgPieSeriesOptions
} from 'ag-charts-community';
import { formatLocale } from 'd3-format';
import { EChartsInitOpts, EChartsOption } from 'echarts';
import { MconfigField } from '~common/_index';
import { getChartCurve } from '~front/app/functions/get-chart-curve';
import { getChartScheme } from '~front/app/functions/get-chart-scheme';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import {
  DataService,
  QDataRow,
  SeriesDataElement
} from '~front/app/services/data.service';
import { FormatNumberService } from '~front/app/services/format-number.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-chart-view',
  templateUrl: './chart-view.component.html'
})
export class ChartViewComponent implements OnChanges {
  chartTypeEnum = common.ChartTypeEnum;
  chartSchemeTypeEnum = common.ChartSchemeTypeEnum;
  queryStatusEnum = common.QueryStatusEnum;

  chartOptions: AgChartOptions;

  eChartInitOpts: any;
  eChartOptions: EChartsOption;

  // isInitialized = false;

  agChartTypes = [
    common.ChartTypeEnum.AgLine,
    common.ChartTypeEnum.AgArea,
    common.ChartTypeEnum.AgBar,
    common.ChartTypeEnum.AgScatter,
    common.ChartTypeEnum.AgBubble,
    common.ChartTypeEnum.AgPie,
    common.ChartTypeEnum.AgDonut
  ];

  agMultiChartTypes = [
    common.ChartTypeEnum.AgLine,
    common.ChartTypeEnum.AgArea,
    common.ChartTypeEnum.AgBar,
    common.ChartTypeEnum.AgScatter,
    common.ChartTypeEnum.AgBubble
    // common.ChartTypeEnum.AgPie,
    // common.ChartTypeEnum.AgDonut
  ];

  eChartsTypes = [
    common.ChartTypeEnum.ELine,
    common.ChartTypeEnum.EBar,
    common.ChartTypeEnum.EScatter,
    // common.ChartTypeEnum.EBubble,
    common.ChartTypeEnum.EPie,
    common.ChartTypeEnum.EHeatMap,
    common.ChartTypeEnum.ETreeMap,
    common.ChartTypeEnum.EGauge
  ];

  eChartsMultiChartTypes = [
    common.ChartTypeEnum.ELine,
    common.ChartTypeEnum.EBar,
    common.ChartTypeEnum.EScatter
    // common.ChartTypeEnum.EBubble
    // common.ChartTypeEnum.EPie,
    // common.ChartTypeEnum.EHeatMap,
    // common.ChartTypeEnum.ETreeMap,
    // common.ChartTypeEnum.EGauge,
  ];

  @Input()
  mconfigFields: common.MconfigField[];

  @Input()
  qData: QDataRow[];

  @Input()
  chart: common.MconfigChart;

  @Input()
  queryStatus: common.QueryStatusEnum;

  seriesData: SeriesDataElement[] = [];
  eData: any[] = [];

  single: any[] = [];
  singleForNumberCard: any[] = [];
  value: number;
  previousValue: number;

  scheme: any;
  curve: any;

  isSelectValid = false;
  errorMessage = '';

  timeline = common.CHART_DEFAULT_TIMELINE;
  rangeFillOpacity = common.CHART_DEFAULT_RANGE_FILL_OPACITY;
  legendForHeatMap = false;
  legendPosition = LegendPosition.Right;

  labelFormattingFn = this.labelFormatting.bind(this);
  dataLabelFormattingFn = this.dataLabelFormatting.bind(this);
  valueFormattingFn = this.valueFormatting.bind(this);
  axisTickFormattingFn = this.axisTickFormatting.bind(this);
  yAxisTickFormattingFn = this.yAxisTickFormatting.bind(this);
  xAxisTickFormattingFn = this.xAxisTickFormatting.bind(this);
  // xAxisTickFormattingForLinearFn = this.xAxisTickFormattingForLinear.bind(this);

  // dataLabelFormattingFn = (value: any) => this.dataLabelFormatting(value);
  // valueFormattingFn = (value: any) => this.valueFormatting(value);
  // axisTickFormattingFn = (value: any) => this.axisTickFormatting(value);
  // yAxisTickFormattingFn = (value: any) => this.yAxisTickFormatting(value);
  // xAxisTickFormattingFn = (value: any) => this.xAxisTickFormatting(value);
  // xAxisTickFormattingForLinearFn = (value: any) => this.xAxisTickFormattingForLinear(value);

  constructor(
    private dataService: DataService,
    private formatNumberService: FormatNumberService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('chart-view ngOnChanges');
    // if (this.isInitialized === true) {
    this.updateChart();
    // }
  }

  // ngAfterViewInit() {
  // console.log('chart-view ngAfterViewInit');
  // this.updateChart();
  // this.isInitialized = true;
  // }

  updateChart() {
    console.log('this.chart');
    console.log(this.chart);

    this.eChartInitOpts = {
      renderer: 'svg'
    } as EChartsInitOpts;

    this.eChartOptions = {
      grid: {
        left: '8%',
        right: '5%',
        top: '10%',
        bottom: '10%'
      },
      tooltip: {}
    };

    this.chartOptions = {};

    let checkSelectResult = getSelectValid({
      chart: this.chart,
      mconfigFields: this.mconfigFields
    });

    this.isSelectValid = checkSelectResult.isSelectValid;
    this.errorMessage = checkSelectResult.errorMessage;

    if (this.isSelectValid === false) {
      this.seriesData = [];
      this.eData = [];
      this.single = [];
      this.singleForNumberCard = [];
      this.value = undefined;
      this.previousValue = undefined;
    } else {
      let xField = common.isDefined(this.chart.xField)
        ? this.mconfigFields.find(v => v.id === this.chart.xField)
        : undefined;

      let yField = common.isDefined(this.chart.yField)
        ? this.mconfigFields.find(v => v.id === this.chart.yField)
        : undefined;

      let sizeField = common.isDefined(this.chart.sizeField)
        ? this.mconfigFields.find(v => v.id === this.chart.sizeField)
        : undefined;

      // echarts - data

      if (this.eChartsTypes.indexOf(this.chart.type) > -1) {
        this.seriesData =
          this.qData.length > 0 &&
          common.isDefined(this.chart.xField) &&
          common.isDefined(this.chart.yFields) &&
          this.chart.yFields.length > 0
            ? this.dataService.makeSeriesData({
                selectFields: this.mconfigFields,
                xFieldId: this.chart.xField,
                sizeFieldId: this.chart.sizeField,
                yFieldsIds:
                  common.yFieldsChartTypes.indexOf(this.chart.type) > -1
                    ? this.chart.yFields
                    : [this.chart.yField],
                multiFieldId: this.chart.multiField,
                // TODO: time
                data:
                  xField?.result === common.FieldResultEnum.Number
                    ? [...this.qData].sort((a: QDataRow, b: QDataRow) =>
                        Number(a[xField.sqlName].value) >
                        Number(b[xField.sqlName].value)
                          ? 1
                          : Number(b[xField.sqlName].value) >
                            Number(a[xField.sqlName].value)
                          ? -1
                          : 0
                      )
                    : this.qData
              })
            : [];
      }

      // echarts - axes

      if (
        this.chart.type === common.ChartTypeEnum.ELine ||
        this.chart.type === common.ChartTypeEnum.EBar ||
        this.chart.type === common.ChartTypeEnum.EScatter
      ) {
        this.eChartOptions.xAxis = {
          type:
            xField.result === common.FieldResultEnum.Ts
              ? 'time'
              : xField.result === common.FieldResultEnum.Number
              ? 'value'
              : 'category'
        };

        this.eChartOptions.yAxis = {
          type: 'value'
        };
      }

      // echarts - series

      if (this.eChartsTypes.indexOf(this.chart.type) > -1) {
        this.eChartOptions.series = this.seriesData.map(el => {
          let a = {
            type: this.chart.type.split('_')[1] as any,
            name: el.seriesName,
            data: el.seriesPoints.map((x: any) =>
              this.chart.type === common.ChartTypeEnum.EScatter &&
              common.isDefined(this.chart.sizeField)
                ? [x.name, x.value, x.sizeValue]
                : this.chart.type === common.ChartTypeEnum.EPie
                ? {
                    value: x.value,
                    name: x.name
                  }
                : [x.name, x.value]
            )
          };

          if (
            this.chart.type === common.ChartTypeEnum.EScatter &&
            common.isDefined(this.chart.sizeField)
          ) {
            (a as any).symbolSize = function (data: any) {
              return 5 + data[2] * 25;
            };
          }

          return a;
        });
      }

      this.makeNgxCharts();

      this.makeAgCharts({
        xField: xField,
        yField: yField,
        sizeField: sizeField
      });
    }

    console.log('this.eData:');
    console.log(this.eData);

    console.log('this.multi:');
    console.log(this.seriesData);

    console.log('this.eChartOptions:');
    console.log(this.eChartOptions);

    // console.log('this.chart');
    // console.log(this.chart);

    this.cd.detectChanges();
  }

  onSelect(event: any) {}

  dataLabelFormatting(value: any) {
    let { field, formatNumber } =
      this.formatNumberService.getFormatNumberDataLabel({
        chart: this.chart,
        mconfigFields: this.mconfigFields
      });

    let locale = formatLocale({
      decimal: constants.FORMAT_NUMBER_DECIMAL,
      thousands: constants.FORMAT_NUMBER_THOUSANDS,
      grouping: constants.FORMAT_NUMBER_GROUPING,
      currency: [field.currencyPrefix, field.currencySuffix]
    });

    //
    if (common.isDefined(value.value)) {
      value = value.value;
    }

    if (isNaN(value) === true) {
      value = value.split(',').join('');
    }

    if (isNaN(value) === false && common.isDefined(formatNumber)) {
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
    //   decimal: constants.FORMAT_NUMBER_DECIMAL,
    //   thousands: constants.FORMAT_NUMBER_THOUSANDS,
    //   grouping: constants.FORMAT_NUMBER_GROUPING,
    //   currency: [field.currencyPrefix, field.currencySuffix]
    // });

    //
    if (common.isDefined(value.label)) {
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

    // if (isNaN(value) === false && common.isDefined(formatNumber)) {
    //   value = locale.format(formatNumber)(Number(value));
    // }

    return value;
  }

  valueFormatting(value: any) {
    let { field, formatNumber } = this.formatNumberService.getFormatNumberValue(
      {
        chart: this.chart,
        mconfigFields: this.mconfigFields
      }
    );

    let locale = formatLocale({
      decimal: constants.FORMAT_NUMBER_DECIMAL,
      thousands: constants.FORMAT_NUMBER_THOUSANDS,
      grouping: constants.FORMAT_NUMBER_GROUPING,
      currency: [field.currencyPrefix, field.currencySuffix]
    });

    // ngx-charts-number-card passes data instead of value
    if (common.isDefined(value.value)) {
      value = value.value;
    }

    if (isNaN(value) === true) {
      value = value.split(',').join('');
    }

    if (isNaN(value) === false && common.isDefined(formatNumber)) {
      value = locale.format(formatNumber)(Number(value));
    }

    return value;
  }

  axisTickFormatting(value: any) {
    let { field, formatNumber } =
      this.formatNumberService.getFormatNumberAxisTick({
        chart: this.chart,
        mconfigFields: this.mconfigFields
      });

    let locale = formatLocale({
      decimal: constants.FORMAT_NUMBER_DECIMAL,
      thousands: constants.FORMAT_NUMBER_THOUSANDS,
      grouping: constants.FORMAT_NUMBER_GROUPING,
      currency: [field.currencyPrefix, field.currencySuffix]
    });

    // ngx-charts-gauge passes string with commas instead of number
    if (isNaN(value) === true) {
      value = value.split(',').join('');
    }

    if (isNaN(value) === false && common.isDefined(formatNumber)) {
      value = locale.format(formatNumber)(Number(value));
    }

    return value;
  }

  yAxisTickFormatting(value: any) {
    let { field, formatNumber } =
      this.formatNumberService.getFormatNumberYAxisTick({
        chart: this.chart,
        mconfigFields: this.mconfigFields
      });

    let locale = formatLocale({
      decimal: constants.FORMAT_NUMBER_DECIMAL,
      thousands: constants.FORMAT_NUMBER_THOUSANDS,
      grouping: constants.FORMAT_NUMBER_GROUPING,
      currency: [field.currencyPrefix, field.currencySuffix]
    });

    // ngx charts horizontal passes data instead of value
    if (common.isDefined(value.value)) {
      value = value.value;
    }

    if (isNaN(value) === false && common.isDefined(formatNumber)) {
      value = locale.format(formatNumber)(Number(value));
    }

    return value;
  }

  xAxisTickFormatting(value: any) {
    let { field, formatNumber } =
      this.formatNumberService.getFormatNumberXAxisTick({
        chart: this.chart,
        mconfigFields: this.mconfigFields
      });

    let locale = formatLocale({
      decimal: constants.FORMAT_NUMBER_DECIMAL,
      thousands: constants.FORMAT_NUMBER_THOUSANDS,
      grouping: constants.FORMAT_NUMBER_GROUPING,
      currency: [field.currencyPrefix, field.currencySuffix]
    });

    if (common.isDefined(value.value)) {
      value = value.value;
    }

    if (isNaN(value) === false && common.isDefined(formatNumber)) {
      value = locale.format(formatNumber)(Number(value));
    }

    return value;
  }

  // xAxisTickFormattingForLinear(value: any) {}

  makeNgxCharts() {
    // ngx charts data
    this.scheme = getChartScheme(this.chart.colorScheme);
    this.curve = getChartCurve(this.chart.interpolation);

    if (
      this.chart.type === common.ChartTypeEnum.BarVertical ||
      this.chart.type === common.ChartTypeEnum.BarHorizontal ||
      this.chart.type === common.ChartTypeEnum.Pie ||
      this.chart.type === common.ChartTypeEnum.PieAdvanced ||
      this.chart.type === common.ChartTypeEnum.PieGrid ||
      this.chart.type === common.ChartTypeEnum.TreeMap ||
      this.chart.type === common.ChartTypeEnum.Gauge
    ) {
      this.single =
        this.qData.length > 0 &&
        common.isDefined(this.chart.xField) &&
        common.isDefined(this.chart.yField)
          ? this.dataService.getSingleData({
              selectFields: this.mconfigFields,
              xFieldId: this.chart.xField,
              yFieldId: this.chart.yField,
              data: this.qData
            })
          : [];
    } else if (this.chart.type === common.ChartTypeEnum.NumberCard) {
      this.singleForNumberCard =
        this.qData.length > 0 && common.isDefined(this.chart.yField)
          ? this.dataService.getSingleDataForNumberCard({
              selectFields: this.mconfigFields,
              xFieldId: this.chart.xField,
              yFieldId: this.chart.yField,
              data: this.qData
            })
          : [];
    } else if (this.chart.type === common.ChartTypeEnum.GaugeLinear) {
      [this.value, this.previousValue] =
        this.qData.length > 0 && common.isDefined(this.chart.valueField)
          ? this.dataService.getValueData({
              mconfigFields: this.mconfigFields,
              data: this.qData,
              currentValueFieldId: this.chart.valueField,
              previousValueFieldId: this.chart.previousValueField
            })
          : [0, 0];
    } else if (
      this.chart.type === common.ChartTypeEnum.BarVerticalGrouped ||
      this.chart.type === common.ChartTypeEnum.BarHorizontalGrouped ||
      this.chart.type === common.ChartTypeEnum.BarVerticalStacked ||
      this.chart.type === common.ChartTypeEnum.BarHorizontalStacked ||
      this.chart.type === common.ChartTypeEnum.BarVerticalNormalized ||
      this.chart.type === common.ChartTypeEnum.BarHorizontalNormalized ||
      this.chart.type === common.ChartTypeEnum.Line ||
      this.chart.type === common.ChartTypeEnum.Area ||
      this.chart.type === common.ChartTypeEnum.AreaStacked ||
      this.chart.type === common.ChartTypeEnum.AreaNormalized ||
      this.chart.type === common.ChartTypeEnum.HeatMap
    ) {
      this.seriesData =
        this.qData.length > 0 &&
        common.isDefined(this.chart.xField) &&
        common.isDefined(this.chart.yFields) &&
        this.chart.yFields.length > 0
          ? this.dataService.makeSeriesData({
              selectFields: this.mconfigFields,
              xFieldId: this.chart.xField,
              sizeFieldId: this.chart.sizeField,
              yFieldsIds: this.chart.yFields,
              multiFieldId: this.chart.multiField,
              data: this.qData
            })
          : [];
    }
  }

  makeAgCharts(item: {
    xField: MconfigField;
    yField: MconfigField;
    sizeField: MconfigField;
  }) {
    let { xField, yField, sizeField } = item;

    // ag chart - data

    if (this.agMultiChartTypes.indexOf(this.chart.type) > -1) {
      if (common.isUndefined(this.chart.multiField)) {
        this.chartOptions.data = this.dataService.makeAgData({
          qData: this.qData,
          xField: xField
        });
      } else {
        this.seriesData =
          this.qData.length > 0 &&
          common.isDefined(this.chart.xField) &&
          common.isDefined(this.chart.yFields) &&
          this.chart.yFields.length > 0
            ? this.dataService.makeSeriesData({
                selectFields: this.mconfigFields,
                xFieldId: this.chart.xField,
                sizeFieldId: this.chart.sizeField,
                yFieldsIds: this.chart.yFields,
                multiFieldId: this.chart.multiField,
                data: this.qData
              })
            : [];

        let agMultiData: any = [];

        this.seriesData.forEach(el => {
          el.seriesPoints.forEach((element: any) => {
            let rowElement: any = agMultiData.find(
              (x: any) => x[xField.sqlName] === element.name
            );
            if (common.isUndefined(rowElement)) {
              rowElement = {};
              agMultiData.push(rowElement);
            }
            rowElement[xField.sqlName] = element.name;
            rowElement[el.seriesName] = element.value;
          });
        });

        this.chartOptions.data = agMultiData;
      }
    } else if (this.agChartTypes.indexOf(this.chart.type) > -1) {
      this.chartOptions.data = this.dataService.makeAgData({
        qData: this.qData,
        xField: xField
      });
    }

    // ag chart - axes

    if (this.agChartTypes.indexOf(this.chart.type) > -1) {
      if (xField.result === common.FieldResultEnum.Ts) {
        (this.chartOptions as AgCartesianChartOptions).axes = [
          {
            type: 'time',
            position: 'bottom'
          },
          {
            type: 'number',
            position: 'left'
          }
        ];
      } else if (xField.result === common.FieldResultEnum.Number) {
        (this.chartOptions as AgCartesianChartOptions).axes = [
          {
            type: 'number',
            position: 'bottom'
          },
          {
            type: 'number',
            position: 'left'
          }
        ];
      } else {
        (this.chartOptions as AgCartesianChartOptions).axes = [
          {
            type: 'category',
            position: 'bottom'
          },
          {
            type: 'number',
            position: 'left'
          }
        ];
      }
    }

    // ag chart - series

    if (this.agMultiChartTypes.indexOf(this.chart.type) > -1) {
      this.chartOptions.series = common.isDefined(this.chart.multiField)
        ? this.seriesData.map(el => {
            let a = {
              type: this.chart.type.split('_')[1] as any,
              xKey: xField.sqlName,
              yKey: el.seriesName
            };

            if (this.chart.type === common.ChartTypeEnum.AgBubble) {
              (a as AgBubbleSeriesOptions).sizeKey = common.isDefined(
                sizeField?.sqlName
              )
                ? sizeField?.sqlName
                : common.CHART_DEFAULT_SIZE_FIELD_VALUE;
            }

            return a;
          })
        : this.chart.yFields.map(x => {
            let myYField = this.mconfigFields.find(f => f.id === x);

            let a = {
              type: this.chart.type.split('_')[1] as any,
              xKey: xField.sqlName,
              yKey: myYField.sqlName
            };

            if (this.chart.type === common.ChartTypeEnum.AgBubble) {
              (a as AgBubbleSeriesOptions).sizeKey = common.isDefined(
                sizeField?.sqlName
              )
                ? sizeField?.sqlName
                : common.CHART_DEFAULT_SIZE_FIELD_VALUE;
            }

            return a;
          });
    } else if (this.chart.type === common.ChartTypeEnum.AgPie) {
      this.chartOptions.series = [
        {
          type: this.chart.type.split('_')[1] as any,
          angleKey: yField.sqlName,
          sectorLabelKey: xField.sqlName,
          calloutLabelKey: xField.sqlName
        } as AgPieSeriesOptions
      ];
    } else if (this.chart.type === common.ChartTypeEnum.AgDonut) {
      this.chartOptions.series = [
        {
          type: this.chart.type.split('_')[1] as any,
          angleKey: yField.sqlName,
          // sectorLabelKey: xField.sqlName,
          calloutLabelKey: xField.sqlName,
          innerRadiusRatio: 0.7
        } as AgDonutSeriesOptions
      ];
    } else if (this.agChartTypes.indexOf(this.chart.type) > -1) {
      this.chartOptions.series = [
        {
          type: this.chart.type.split('_')[1] as any,
          xKey: xField.sqlName,
          yKey: yField.sqlName
        }
      ];
    }
  }
}
