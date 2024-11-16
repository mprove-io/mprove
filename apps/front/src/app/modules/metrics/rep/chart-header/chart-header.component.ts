import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams, IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs';
import { DataRow } from '~front/app/interfaces/data-row';
import { UiQuery } from '~front/app/queries/ui.query';
import { UiService } from '~front/app/services/ui.service';

@Component({
  selector: 'm-chart-header',
  templateUrl: './chart-header.component.html'
})
export class ChartHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  showMetricsChart = false;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showMetricsChart = x.showMetricsChart;
      this.cd.detectChanges();
    })
  );

  repSelectedNodes: IRowNode<DataRow>[] = [];
  repSelectedNodes$ = this.uiQuery.repSelectedNodes$.pipe(
    tap(x => {
      this.repSelectedNodes = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private uiService: UiService
  ) {}

  agInit(params: IHeaderParams) {
    this.params = params;
  }

  refresh(params: IHeaderParams) {
    this.params = params;
    return true;
  }

  toggleShowMetricsChart() {
    if (this.repSelectedNodes.length > 0) {
      return;
    }

    let showMetricsChart = !this.showMetricsChart;

    this.uiQuery.updatePart({
      showMetricsChart: showMetricsChart
    });

    this.uiService.setUserUi({
      showMetricsChart: showMetricsChart
    });
  }
}
