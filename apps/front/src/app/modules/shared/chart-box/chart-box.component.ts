import { Component, Input } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'm-chart-box',
  templateUrl: './chart-box.component.html'
})
export class ChartBoxComponent {
  @Input()
  eChartInitOpts: any;

  @Input()
  eChartOptions: EChartsOption;

  @Input()
  chartInstanceId: string; // not in use - html - [id]="chartInstanceId"

  echartsInstance: any;

  constructor() {}

  onChartInit(ec: any) {
    this.echartsInstance = ec;
    ec.getZr().on('mousemove', function (params: any) {
      ec.getZr().setCursorStyle('default');
    });
  }
}
