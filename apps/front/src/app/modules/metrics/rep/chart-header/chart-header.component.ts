import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { tap } from 'rxjs';
import { UiQuery } from '~front/app/queries/ui.query';

@Component({
  selector: 'm-chart-header',
  templateUrl: './chart-header.component.html'
})
export class ChartHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  showMetricsChart = false;
  showMetricsChartSettings = false;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showMetricsChart = x.showMetricsChart;
      this.showMetricsChartSettings = x.showMetricsChartSettings;
    })
  );

  constructor(private cd: ChangeDetectorRef, private uiQuery: UiQuery) {}

  agInit(params: IHeaderParams) {
    this.params = params;
  }

  refresh(params: IHeaderParams) {
    this.params = params;
    return true;
  }

  toggleShowMetricsChart() {
    this.uiQuery.updatePart({
      showMetricsChart: !this.showMetricsChart
    });
  }

  toggleShowMetricsChartSettings() {
    if (this.showMetricsChart === true) {
      this.uiQuery.updatePart({
        showMetricsChartSettings: !this.showMetricsChartSettings
      });
    }
  }
}
