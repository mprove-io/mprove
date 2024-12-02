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
import { getChartCurve } from '~front/app/functions/get-chart-curve';
import { getChartScheme } from '~front/app/functions/get-chart-scheme';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { DataService } from '~front/app/services/data.service';
import { FormatNumberService } from '~front/app/services/format-number.service';
import { RData } from '~front/app/services/query.service';
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

  @Input()
  mconfigFields: common.MconfigField[];

  @Input()
  qData: RData[];

  @Input()
  chart: common.MconfigChart;

  @Input()
  queryStatus: common.QueryStatusEnum;

  single: any[] = [];
  singleForNumberCard: any[] = [];
  multi: any[] = [];
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
    // let seriesType: string;
    // let seriesElement;

    // this.setAgChartsDefaults();

    let checkSelectResult = getSelectValid({
      chart: this.chart,
      mconfigFields: this.mconfigFields
    });

    this.isSelectValid = checkSelectResult.isSelectValid;
    this.errorMessage = checkSelectResult.errorMessage;

    this.scheme = getChartScheme(this.chart.colorScheme);
    this.curve = getChartCurve(this.chart.interpolation);

    let xField = this.mconfigFields.find(v => v.id === this.chart.xField);
    let yField = this.mconfigFields.find(v => v.id === this.chart.yField);

    // data

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
      this.multi =
        this.qData.length > 0 &&
        common.isDefined(this.chart.xField) &&
        common.isDefined(this.chart.yFields) &&
        this.chart.yFields.length > 0
          ? this.dataService.getMultiData({
              selectFields: this.mconfigFields,
              xFieldId: this.chart.xField,
              yFieldsIds: this.chart.yFields,
              multiFieldId: this.chart.multiField,
              data: this.qData,
              chartType: this.chart.type
            })
          : [];
    } else if (this.agMultiChartTypes.indexOf(this.chart.type) > -1) {
      if (common.isUndefined(this.chart.multiField)) {
        this.chartOptions.data = this.dataService.makeAgData({
          qData: this.qData,
          xField: xField
        });
      } else {
        this.multi =
          this.qData.length > 0 &&
          common.isDefined(this.chart.xField) &&
          common.isDefined(this.chart.yFields) &&
          this.chart.yFields.length > 0
            ? this.dataService.getMultiData({
                selectFields: this.mconfigFields,
                xFieldId: this.chart.xField,
                yFieldsIds: this.chart.yFields,
                multiFieldId: this.chart.multiField,
                data: this.qData,
                chartType: this.chart.type
              })
            : [];

        let agMultiData: any = [];

        this.multi.forEach(el => {
          el.series.forEach((element: any) => {
            let rowElement: any = agMultiData.find(
              (x: any) => x[xField.sqlName] === element.name
            );
            if (common.isUndefined(rowElement)) {
              rowElement = {};
              agMultiData.push(rowElement);
            }
            rowElement[xField.sqlName] = element.name;
            rowElement[el.name] = element.value;
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
        ? this.multi.map(el => {
            let a = {
              type: this.chart.type.split('_')[1] as any,
              xKey: xField.sqlName,
              yKey: el.name
            };

            if (this.chart.type === common.ChartTypeEnum.AgBubble) {
              (a as AgBubbleSeriesOptions).sizeKey = el.name; // TODO: create sizeKey control
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
              (a as AgBubbleSeriesOptions).sizeKey = myYField.sqlName; // TODO: create sizeKey control
            }

            return a;
          });
      // } else if (this.chart.type === common.ChartTypeEnum.AgScatter) {
      //   this.chartOptions.series = [
      //     {
      //       type: this.chart.type.split('_')[1] as any,
      //       xKey: xField.sqlName,
      //       yKey: yField.sqlName
      //     } as AgScatterSeriesOptions
      //   ];
      // } else if (this.chart.type === common.ChartTypeEnum.AgBubble) {
      //   this.chartOptions.series = [
      //     {
      //       type: this.chart.type.split('_')[1] as any,
      //       xKey: xField.sqlName,
      //       yKey: yField.sqlName,
      //       sizeKey: yField.sqlName // TODO: create sizeKey control
      //     } as AgBubbleSeriesOptions
      //   ];
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
}
