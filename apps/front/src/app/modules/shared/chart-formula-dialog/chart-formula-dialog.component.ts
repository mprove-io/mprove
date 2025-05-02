import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { EChartsOption } from 'echarts';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ChartPointsData } from '~front/app/interfaces/chart-formula-data';
import { DataPoint } from '~front/app/interfaces/data-point';
import { DataRow } from '~front/app/interfaces/data-row';
import { UiQuery } from '~front/app/queries/ui.query';
import { DataService } from '~front/app/services/data.service';
import { common } from '~front/barrels/common';
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
  imports: [CommonModule, UiSwitchModule, TippyDirective, SharedModule]
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
    this.eChartInitOpts = this.ref.data.chartPointsData.eChartInitOpts;

    this.eChartOptions = Object.assign(
      {},
      this.ref.data.chartPointsData.eChartOptions,
      {
        animation: false,
        series: this.dataService.metricsRowToSeries({
          isMiniChart: false,
          row: row,
          dataPoints: this.dataPoints,
          chartSeriesElement: undefined,
          showMetricsModelName: this.uiQuery.getValue().showMetricsModelName,
          showMetricsTimeFieldName:
            this.uiQuery.getValue().showMetricsTimeFieldName
        })
      }
    );
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

        if (common.isDefined(record?.value)) {
          recordsWithValuesLength++;
        }
      });

    this.recordsWithValuesLength = recordsWithValuesLength;
  }
}
