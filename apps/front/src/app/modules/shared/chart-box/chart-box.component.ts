import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import equal from 'fast-deep-equal';
import { isDefined } from '~common/functions/is-defined';

@Component({
  standalone: false,
  selector: 'm-chart-box',
  templateUrl: './chart-box.component.html'
})
export class ChartBoxComponent implements OnChanges {
  echartsApiInstance: any;

  @Input()
  chartInstanceId: string;

  @Input()
  eChartInitOpts: any;

  @Input()
  eChartOptions: EChartsOption;

  localChartInstanceId: string; // not in use - html - [id]="ecChartInstanceId"
  localInitOpts: any;
  localOptions: EChartsOption;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      isDefined(changes.chartInstanceId) &&
      changes.chartInstanceId.currentValue !==
        changes.chartInstanceId.previousValue
    ) {
      this.localChartInstanceId = changes.chartInstanceId.currentValue;
    }

    if (
      isDefined(changes.eChartInitOpts) &&
      equal(
        JSON.stringify(changes.eChartInitOpts.currentValue),
        JSON.stringify(changes.eChartInitOpts.previousValue)
      ) === false
    ) {
      this.localInitOpts = changes.eChartInitOpts.currentValue;
    }

    if (
      isDefined(changes.eChartOptions) &&
      equal(
        JSON.stringify(changes.eChartOptions.currentValue),
        JSON.stringify(changes.eChartOptions.previousValue)
      ) === false
    ) {
      this.localOptions = changes.eChartOptions.currentValue;
    }
  }

  onChartInit(ec: any) {
    this.echartsApiInstance = ec;

    ec.getZr().on('mousemove', function (params: any) {
      ec.getZr().setCursorStyle('default');
    });
  }
}
