import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { EChartsInitOpts, EChartsOption } from 'echarts';
import { UiSwitchModule } from 'ngx-ui-switch';
import { frontFormatTsUnix } from '~front/app/functions/front-format-ts-unix';
import { ChartPointsData } from '~front/app/interfaces/chart-points-data';
import { DataPoint } from '~front/app/interfaces/data-point';
import { DataRow } from '~front/app/interfaces/data-row';
import { UiQuery } from '~front/app/queries/ui.query';
import { DataService } from '~front/app/services/data.service';
import { SharedModule } from '../shared.module';

export interface ChartFormulaDialogData {
  row: DataRow;
  chartPointsData: ChartPointsData;
}

@Component({
  selector: 'm-chart-formula-dialog',
  templateUrl: './chart-formula-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, UiSwitchModule, SharedModule]
})
export class ChartFormulaDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  isShow = true;

  title: string;

  dataPoints: DataPoint[] = [];

  eChartInitOpts: any;
  eChartOptions: EChartsOption;

  newQueriesLength = 0;
  runningQueriesLength = 0;
  recordsWithValuesLength = 0;

  constructor(
    public ref: DialogRef<ChartFormulaDialogData>,
    private uiQuery: UiQuery,
    private dataService: DataService
  ) {}

  ngOnInit() {
    console.log('this.ref.data');
    console.log(this.ref.data);

    let row = this.ref.data.row;

    this.dataPoints = this.ref.data.chartPointsData.dataPoints;

    this.eChartInitOpts = {
      renderer: 'svg'
    } as EChartsInitOpts;

    this.eChartOptions = (<EChartsOption>{
      animation: false,
      useUTC: true,
      grid: {
        left: 100,
        right: 50,
        top: 95,
        bottom: 35
      },
      textStyle: {
        fontFamily: 'sans-serif'
      },
      legend: {
        top: 20,
        padding: [0, 0, 0, 0],
        textStyle: {
          fontSize: 15,
          fontFamily: "'Montserrat', sans-serif"
        }
      },
      tooltip: {
        confine: true,
        trigger: 'axis',
        order: 'valueDesc',
        valueFormatter: (value: any) =>
          `${isDefined(value) ? value.toFixed(2) : 'Null'}`
      },
      xAxis: {
        type: 'time',
        axisLabel:
          [
            TimeSpecEnum.Hours,
            TimeSpecEnum.Minutes,
            TimeSpecEnum.Timestamps
          ].indexOf(this.uiQuery.getValue().timeSpec) > -1
            ? { fontSize: 13 }
            : {
                fontSize: 13,
                formatter: (value: any) => {
                  let timeSpec = this.uiQuery.getValue().timeSpec;

                  return frontFormatTsUnix({
                    timeSpec: timeSpec,
                    unixTimeZoned: value / 1000
                  });
                }
              }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 14
        }
      },
      series: this.dataService.metricsRowToSeries({
        isMiniChart: false,
        row: row,
        dataPoints: this.dataPoints,
        chartSeriesElement: undefined,
        showMetricsModelName: this.uiQuery.getValue().showMetricsModelName,
        showMetricsTimeFieldName:
          this.uiQuery.getValue().showMetricsTimeFieldName
      })
    }) as EChartsOption;

    this.title = (this.eChartOptions.series as any).name;

    this.newQueriesLength = this.ref.data.chartPointsData.newQueriesLength;
    this.runningQueriesLength =
      this.ref.data.chartPointsData.runningQueriesLength;

    let recordsWithValuesLength = 0;

    this.uiQuery
      .getValue()
      .repChartData.columns.filter(column => column.columnId !== 0)
      .forEach(column => {
        let record = row.records.find(rec => rec.key === column.columnId);

        if (isDefined(record?.value)) {
          recordsWithValuesLength++;
        }
      });

    this.recordsWithValuesLength = recordsWithValuesLength;
  }
}
