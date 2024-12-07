import { Component, Input } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'm-chart-view-metrics',
  templateUrl: './chart-view-metrics.component.html'
})
export class ChartViewMetricsComponent {
  @Input()
  eChartInitOpts: any;

  @Input()
  eChartOptions: EChartsOption;

  constructor() {}
}
