import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { LegendPosition } from '@swimlane/ngx-charts';
import { AgCartesianChartOptions, AgChartOptions } from 'ag-charts-community';
import { formatLocale } from 'd3-format';
import { getChartCurve } from '~front/app/functions/get-chart-curve';
import { getChartScheme } from '~front/app/functions/get-chart-scheme';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { DataService } from '~front/app/services/data.service';
import { FormatNumberService } from '~front/app/services/format-number.service';
import { RData } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { femaleHeightWeight, maleHeightWeight } from './scatter-mock';

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
    common.ChartTypeEnum.AgBar,
    common.ChartTypeEnum.AgLine,
    common.ChartTypeEnum.AgArea,
    common.ChartTypeEnum.AgPie,
    common.ChartTypeEnum.AgDonut,
    common.ChartTypeEnum.AgBubble,
    common.ChartTypeEnum.AgScatter
  ];
  agMultiChartTypes = [
    common.ChartTypeEnum.AgBar,
    common.ChartTypeEnum.AgLine,
    common.ChartTypeEnum.AgArea
    // common.ChartTypeEnum.AgPie,
    // common.ChartTypeEnum.AgDonut,
    // common.ChartTypeEnum.AgBubble,
    // common.ChartTypeEnum.AgScatter
  ];

  @Input()
  mconfigFields: common.MconfigField[];

  @Input()
  qData: RData[];

  @Input()
  chart: common.Chart;

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
    if (this.chart.type === common.ChartTypeEnum.AgBar) {
      // seriesType = 'bar';
      this.chartOptions = {
        title: {
          text: 'AG BAR'
        },
        data: [
          {
            quarter: 'Q1',
            petrol: 200,
            diesel: 100
          },
          {
            quarter: 'Q2',
            petrol: 300,
            diesel: 130
          },
          {
            quarter: 'Q3',
            petrol: 350,
            diesel: 160
          },
          {
            quarter: 'Q4',
            petrol: 400,
            diesel: 200
          }
        ],
        series: [
          {
            type: 'bar',
            xKey: 'quarter',
            yKey: 'diesel',
            yName: 'Diesel',
            visible: this.chart.axVisible
          }
        ]
      };
    }

    if (this.chart.type === common.ChartTypeEnum.AgLine) {
      this.chartOptions = {
        title: {
          text: 'AG LINE'
        },
        data: [
          {
            quarter: 'Q1',
            petrol: 200,
            diesel: 100
          },
          {
            quarter: 'Q2',
            petrol: 300,
            diesel: 130
          },
          {
            quarter: 'Q3',
            petrol: 350,
            diesel: 160
          },
          {
            quarter: 'Q4',
            petrol: 400,
            diesel: 200
          }
        ],
        series: [
          {
            type: 'line',
            xKey: 'quarter',
            yKey: 'diesel',
            yName: 'Diesel',
            visible: this.chart.axVisible
          }
        ]
      };
    }

    if (this.chart.type === common.ChartTypeEnum.AgArea) {
      this.chartOptions = {
        title: {
          text: 'AG AREA'
        },
        data: [
          {
            quarter: 'Q1',
            petrol: 200,
            diesel: 100
          },
          {
            quarter: 'Q2',
            petrol: 300,
            diesel: 130
          },
          {
            quarter: 'Q3',
            petrol: 350,
            diesel: 160
          },
          {
            quarter: 'Q4',
            petrol: 400,
            diesel: 200
          }
        ],
        series: [
          {
            type: 'area',
            xKey: 'quarter',
            yKey: 'diesel',
            yName: 'Diesel',
            visible: this.chart.axVisible
          }
        ]
      };
    }

    if (this.chart.type === common.ChartTypeEnum.AgScatter) {
      this.chartOptions = {
        title: {
          text: 'AG SCATTER'
        },
        data: [
          {
            quarter: 'Q1',
            petrol: 200,
            diesel: 100
          },
          {
            quarter: 'Q2',
            petrol: 300,
            diesel: 130
          },
          {
            quarter: 'Q3',
            petrol: 350,
            diesel: 160
          },
          {
            quarter: 'Q4',
            petrol: 400,
            diesel: 200
          }
        ],
        series: [
          {
            type: 'scatter',
            title: 'Male',
            data: maleHeightWeight,
            xKey: 'height',
            xName: 'Height',
            yKey: 'weight',
            yName: 'Weight'
          },
          {
            type: 'scatter',
            title: 'Female',
            data: femaleHeightWeight,
            xKey: 'height',
            xName: 'Height',
            yKey: 'weight',
            yName: 'Weight'
          }
        ],
        axes: [
          {
            type: 'number',
            position: 'bottom',
            title: {
              text: 'Height'
            },
            label: {
              formatter: params => params.value + 'cm'
            }
          },
          {
            type: 'number',
            position: 'left',
            title: {
              text: 'Weight'
            },
            label: {
              formatter: params => params.value + 'kg'
            }
          }
        ]
      };
    }

    if (this.chart.type === common.ChartTypeEnum.AgBubble) {
      this.chartOptions = {
        title: {
          text: 'AG BUBBLE'
        },
        series: [
          {
            type: 'bubble',
            title: 'Male',
            data: maleHeightWeight,
            xKey: 'height',
            xName: 'Height',
            yKey: 'weight',
            yName: 'Weight',
            sizeKey: 'age',
            sizeName: 'Age'
          },
          {
            type: 'bubble',
            title: 'Female',
            data: femaleHeightWeight,
            xKey: 'height',
            xName: 'Height',
            yKey: 'weight',
            yName: 'Weight',
            sizeKey: 'age',
            sizeName: 'Age'
          }
        ],
        axes: [
          {
            type: 'number',
            position: 'bottom',
            title: {
              text: 'Height'
            },
            label: {
              formatter: params => params.value + 'cm'
            }
          },
          {
            type: 'number',
            position: 'left',
            title: {
              text: 'Weight'
            },
            label: {
              formatter: params => params.value + 'kg'
            }
          }
        ]
      };
    }

    if (this.chart.type === common.ChartTypeEnum.AgPie) {
      this.chartOptions = {
        title: {
          text: 'AG PIE'
        },

        data: [
          { asset: 'Stocks', amount: 60000 },
          { asset: 'Bonds', amount: 40000 },
          { asset: 'Cash', amount: 7000 },
          { asset: 'Real Estate', amount: 5000 },
          { asset: 'Commodities', amount: 3000 }
        ],
        series: [
          {
            type: 'pie',
            angleKey: 'amount',
            legendItemKey: 'asset'
          }
        ]
      };
    }

    if (this.chart.type === common.ChartTypeEnum.AgDonut) {
      this.chartOptions = {
        title: {
          text: 'AG DONUT'
        },
        data: [
          { asset: 'Stocks', amount: 60000 },
          { asset: 'Bonds', amount: 40000 },
          { asset: 'Cash', amount: 7000 },
          { asset: 'Real Estate', amount: 5000 },
          { asset: 'Commodities', amount: 3000 }
        ],
        series: [
          {
            type: 'donut',
            calloutLabelKey: 'asset',
            angleKey: 'amount',
            innerRadiusRatio: 0.7
          }
        ]
      };
    }

    // console.log('updateChart');

    let checkSelectResult = getSelectValid({
      chart: this.chart,
      mconfigFields: this.mconfigFields
    });

    this.isSelectValid = checkSelectResult.isSelectValid;
    this.errorMessage = checkSelectResult.errorMessage;

    this.scheme = getChartScheme(this.chart.colorScheme);
    this.curve = getChartCurve(this.chart.interpolation);

    console.log(this.qData);

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
      // console.log(this.qData);
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
      // console.log(this.multi);
    } else if (this.agMultiChartTypes.indexOf(this.chart.type) > -1) {
      const xField = this.mconfigFields.find(v => v.id === this.chart.xField);

      const yField = this.mconfigFields.find(v => v.id === this.chart.yField);

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
      }
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

      const multiField = this.mconfigFields.find(
        v => v.id === this.chart.multiField
      );

      let series: any = [];
      this.chartOptions.series = common.isDefined(this.chart.multiField)
        ? this.multi.map(el => {
            let a = {
              type: this.chart.type.split('_')[1] as any,
              xKey: xField.sqlName,
              yKey: el.name
            };
            return a;
          })
        : // this.chart.yFields.map(x => {
          //   let myYField = this.mconfigFields.find(f => f.id === x);

          //   let a = {
          //     type: this.chart.type.split('_')[1] as any,
          //     xKey: xField.sqlName,
          //     yKey: myYField.sqlName
          //   };
          //   return a;
          // })
          this.chart.yFields.map(x => {
            let myYField = this.mconfigFields.find(f => f.id === x);

            let a = {
              type: this.chart.type.split('_')[1] as any,
              xKey: xField.sqlName,
              yKey: myYField.sqlName
            };
            return a;
          });

      // this.chartOptions.series = [
      // {
      //   type: this.chart.type.split('_')[1] as any,
      //   xKey: xField.sqlName,
      //   yKey: yField.sqlName
      // }
      // ];

      let newData: any = [];

      if (common.isDefined(this.chart.multiField)) {
        this.multi.forEach(el => {
          el.series.forEach((element: any) => {
            let rowElement: any = newData.find(
              (x: any) => x[xField.sqlName] === element.name
            );
            if (common.isUndefined(rowElement)) {
              rowElement = {};
              newData.push(rowElement);
            }
            rowElement[xField.sqlName] = element.name;
            rowElement[el.name] = element.value;
          });
        });
      }

      this.chartOptions.data = common.isDefined(this.chart.multiField)
        ? newData
        : this.dataService.makeAgData({ qData: this.qData, xField: xField });
      console.log(this.chartOptions.data);
    } else if (
      this.agChartTypes.indexOf(this.chart.type) > -1 &&
      this.agMultiChartTypes.indexOf(this.chart.type) < 0
    ) {
      const xField = this.mconfigFields.find(v => v.id === this.chart.xField);

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
      }

      const yField = this.mconfigFields.find(v => v.id === this.chart.yField);
      this.chartOptions.series = [
        {
          type: this.chart.type.split('_')[1] as any,
          xKey: xField.sqlName,
          yKey: yField.sqlName
        }
      ];

      this.chartOptions.data = this.dataService.makeAgData({
        qData: this.qData,
        xField: xField
      });
    }

    this.cd.detectChanges();

    // console.log(this.chart);
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
