import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { getChartCurve } from '~front/app/functions/get-chart-curve';
import { getChartScheme } from '~front/app/functions/get-chart-scheme';
import { ColumnField } from '~front/app/queries/mconfig.query';
import { DataService } from '~front/app/services/data.service';
import { RData } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-view',
  templateUrl: './chart-view.component.html'
})
export class ChartViewComponent implements OnChanges {
  chartTypeEnum = common.ChartTypeEnum;
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
  multi: any[] = [];
  value: number;
  previousValue: number;

  // colorScheme: common.ChartColorSchemeEnum;
  // interpolation: common.ChartInterpolationEnum;
  scheme: any;
  // schemeType: common.ChartSchemeTypeEnum;
  curve: any;

  constructor(private dataService: DataService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(this.chart?.xField);
    // console.log(this.chart?.yField);
    // console.log(this.qData);
    // console.log(changes);

    // this.schemeType = this.chart.schemeType || common.ChartSchemeTypeEnum.Ordinal;

    // this.colorScheme = this.chart.colorScheme || common.ChartColorSchemeEnum.Cool;
    this.scheme = getChartScheme(this.chart.colorScheme);

    // this.interpolation = this.chart.interpolation || common.ChartInterpolationEnum.Linear;
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
    }
  }

  onSelect(event: any) {}
}
