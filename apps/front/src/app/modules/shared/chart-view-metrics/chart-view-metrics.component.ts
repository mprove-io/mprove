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

  echartsInstance: any;

  constructor() {}

  onChartInit(ec: any) {
    this.echartsInstance = ec;
    ec.getZr().on('mousemove', function (params: any) {
      ec.getZr().setCursorStyle('default');
    });
  }
}
