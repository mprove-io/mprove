import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import equal from 'fast-deep-equal';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-box',
  templateUrl: './chart-box.component.html'
})
export class ChartBoxComponent implements OnChanges {
  // @ViewChild('chartBoxEcharts', { static: false })
  // chartBoxEchartsElement: any;

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

  // ngOnInit(): void {
  //   console.log('onInit');
  // }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('onChanges');
    // console.log(changes);

    if (
      common.isDefined(changes.chartInstanceId) &&
      changes.chartInstanceId.currentValue !==
        changes.chartInstanceId.previousValue
    ) {
      // console.log('set localChartInstanceId');
      this.localChartInstanceId = changes.chartInstanceId.currentValue;
    }

    if (
      common.isDefined(changes.eChartInitOpts) &&
      equal(
        JSON.stringify(changes.eChartInitOpts.currentValue),
        JSON.stringify(changes.eChartInitOpts.previousValue)
      ) === false
    ) {
      // console.log('set localInitOpts');
      this.localInitOpts = changes.eChartInitOpts.currentValue;
    }

    if (
      common.isDefined(changes.eChartOptions) &&
      equal(
        JSON.stringify(changes.eChartOptions.currentValue),
        JSON.stringify(changes.eChartOptions.previousValue)
      ) === false
    ) {
      // console.log('set localOptions');
      this.localOptions = changes.eChartOptions.currentValue;
    }

    // if (common.isDefined(this.echartsInstance)) {
    //   this.echartsInstance.setOption(this.eChartOptions);
    // } else {
    //   this.localInitOpts = this.eChartInitOpts;
    //   this.localOptions = this.eChartOptions;
    // }
  }

  onChartInit(ec: any) {
    // console.log('onChartInit');
    this.echartsApiInstance = ec;

    ec.getZr().on('mousemove', function (params: any) {
      ec.getZr().setCursorStyle('default');
    });
  }
}
