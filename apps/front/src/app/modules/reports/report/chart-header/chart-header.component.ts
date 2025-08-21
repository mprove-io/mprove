import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams, IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs';
import { DataRow } from '~common/interfaces/front/data-row';
import { UiQuery } from '~front/app/queries/ui.query';
import { UiService } from '~front/app/services/ui.service';

@Component({
  standalone: false,
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

  reportSelectedNodes: IRowNode<DataRow>[] = [];
  reportSelectedNodes$ = this.uiQuery.reportSelectedNodes$.pipe(
    tap(x => {
      this.reportSelectedNodes = x;
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
    if (this.reportSelectedNodes.length > 0) {
      return;
    }

    this.uiQuery.updatePart({ showMetricsChart: !this.showMetricsChart });
  }
}
