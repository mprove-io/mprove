import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { formatLocale } from 'd3-format';
import { getChartCurve } from '~front/app/functions/get-chart-curve';
import { getChartScheme } from '~front/app/functions/get-chart-scheme';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { ColumnField } from '~front/app/queries/mq.query';
import { DataService } from '~front/app/services/data.service';
import { RData } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-view',
  templateUrl: './chart-view.component.html'
})
export class ChartViewComponent implements OnChanges {
  chartTypeEnum = common.ChartTypeEnum;
  chartSchemeTypeEnum = common.ChartSchemeTypeEnum;
  queryStatusEnum = common.QueryStatusEnum;

  @Input()
  sortedColumns: ColumnField[];

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
  legendPosition = 'right';

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

  constructor(private dataService: DataService) {}

  ngOnChanges(changes: SimpleChanges): void {
    let checkSelectResult = getSelectValid({
      chartType: this.chart.type,
      sortedColumns: this.sortedColumns
    });

    this.isSelectValid = checkSelectResult.isSelectValid;
    this.errorMessage = checkSelectResult.errorMessage;

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
              selectFields: this.sortedColumns,
              xFieldId: this.chart.xField,
              yFieldId: this.chart.yField,
              data: this.qData
            })
          : [];
    } else if (this.chart.type === common.ChartTypeEnum.NumberCard) {
      this.singleForNumberCard =
        this.qData.length > 0 && common.isDefined(this.chart.yField)
          ? this.dataService.getSingleDataForNumberCard({
              selectFields: this.sortedColumns,
              xFieldId: this.chart.xField,
              yFieldId: this.chart.yField,
              data: this.qData
            })
          : [];
    } else if (this.chart.type === common.ChartTypeEnum.GaugeLinear) {
      [this.value, this.previousValue] =
        this.qData.length > 0 && common.isDefined(this.chart.valueField)
          ? this.dataService.getValueData({
              columnFields: this.sortedColumns,
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
              selectFields: this.sortedColumns,
              xFieldId: this.chart.xField,
              yFieldsIds: this.chart.yFields,
              multiFieldId: this.chart.multiField,
              data: this.qData
            })
          : [];
      // console.log(this.multi);
    }
  }

  onSelect(event: any) {}

  dataLabelFormatting(value: any) {
    let currencyPrefix = 'DDD';
    let currencySuffix = 'LLL';
    let formatNumber = '$,.0f';

    let locale = formatLocale({
      decimal: '.',
      thousands: ' ',
      grouping: [3],
      currency: [currencyPrefix, currencySuffix]
    });

    //
    if (common.isDefined(value.value)) {
      value = value.value;
    }

    if (isNaN(value)) {
      value = value.split(',').join('');
    }

    return locale.format(formatNumber)(Number(value));
  }

  valueFormatting(value: any) {
    let currencyPrefix = 'VVV';
    let currencySuffix = 'FFF';
    let formatNumber = '$,.0f';

    let locale = formatLocale({
      decimal: '.',
      thousands: ' ',
      grouping: [3],
      currency: [currencyPrefix, currencySuffix]
    });

    // ngx-charts-number-card passes data instead of value
    if (common.isDefined(value.value)) {
      value = value.value;
    }

    if (isNaN(value)) {
      value = value.split(',').join('');
    }

    return locale.format(formatNumber)(Number(value));
  }

  axisTickFormatting(value: any) {
    let currencyPrefix = 'AAA';
    let currencySuffix = 'TTT';
    let formatNumber = '$,.0f';

    let locale = formatLocale({
      decimal: '.',
      thousands: ' ',
      grouping: [3],
      currency: [currencyPrefix, currencySuffix]
    });

    // ngx-charts-gauge passes string with commas instead of number
    if (isNaN(value)) {
      value = value.split(',').join('');
    }

    return locale.format(formatNumber)(Number(value));
  }

  yAxisTickFormatting(value: any) {
    let currencyPrefix = 'YYY';
    let currencySuffix = 'TTT';
    let formatNumber = '$,.0f';

    let locale = formatLocale({
      decimal: '.',
      thousands: ' ',
      grouping: [3],
      currency: [currencyPrefix, currencySuffix]
    });

    // ngx charts horizontal passes data instead of value
    if (common.isDefined(value.value)) {
      value = value.value;
    }

    if (isNaN(value) === false) {
      value = locale.format(formatNumber)(Number(value));
    }

    return value;
  }

  xAxisTickFormatting(value: any) {
    let currencyPrefix = 'XXX';
    let currencySuffix = 'TTT';
    let formatNumber = '$,.0f';

    let locale = formatLocale({
      decimal: '.',
      thousands: ' ',
      grouping: [3],
      currency: [currencyPrefix, currencySuffix]
    });

    // console.log(value);

    //
    if (common.isDefined(value.value)) {
      value = value.value;
    }

    // if number
    if (isNaN(value) === false) {
      value = locale.format(formatNumber)(Number(value));
    }

    return value;
  }

  xAxisTickFormattingForLinear(value: any) {
    // let currencyPrefix = 'XXX';
    // let currencySuffix = 'TTT';
    // let formatNumber = '$,.0f';

    // let locale = formatLocale({
    //   decimal: '.',
    //   thousands: ' ',
    //   grouping: [3],
    //   currency: [currencyPrefix, currencySuffix]
    // });

    // //
    // if (common.isDefined(value.value)) {
    //   value = value.value;
    // }

    // // if number
    // if (isNaN(value) === false) {
    //   value = locale.format(formatNumber)(Number(value));
    // }

    // console.log(value);
    return value;
  }
}
