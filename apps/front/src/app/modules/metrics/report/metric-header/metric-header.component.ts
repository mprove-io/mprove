import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams, IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs';
import { DataRow } from '~front/app/interfaces/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ReportService } from '~front/app/services/report.service';
import { UiService } from '~front/app/services/ui.service';

@Component({
  selector: 'm-metric-header',
  templateUrl: './metric-header.component.html'
})
export class MetricHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  reportSelectedNodes: IRowNode<DataRow>[] = [];
  reportSelectedNodes$ = this.uiQuery.reportSelectedNodes$.pipe(
    tap(x => {
      this.reportSelectedNodes = x;
      this.cd.detectChanges();
    })
  );

  showMetricsModelName = false;
  showMetricsTimeFieldName = false;
  showMetricsParameters = false;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showMetricsModelName = x.showMetricsModelName;
      this.showMetricsTimeFieldName = x.showMetricsTimeFieldName;
      this.showMetricsParameters = x.showMetricsParameters;

      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private uiService: UiService,
    private reportService: ReportService,
    private reportQuery: ReportQuery,
    private cd: ChangeDetectorRef
  ) {}

  agInit(params: IHeaderParams) {
    this.params = params;
  }

  refresh(params: IHeaderParams) {
    this.params = params;
    return true;
  }

  deselect() {
    this.params.api.deselectAll();
  }

  toggleShowMetricsModelName() {
    let showMetricsModelName = !this.showMetricsModelName;

    this.uiQuery.updatePart({
      showMetricsModelName: showMetricsModelName
    });

    this.uiService.setUserUi({
      showMetricsModelName: showMetricsModelName
    });
  }

  toggleShowMetricsTimeFieldName() {
    let showMetricsTimeFieldName = !this.showMetricsTimeFieldName;

    this.uiQuery.updatePart({
      showMetricsTimeFieldName: showMetricsTimeFieldName
    });

    this.uiService.setUserUi({
      showMetricsTimeFieldName: showMetricsTimeFieldName
    });
  }

  toggleShowMetricsParameters() {
    let showMetricsParameters = !this.showMetricsParameters;

    this.uiQuery.updatePart({ showMetricsParameters: showMetricsParameters });
    this.uiService.setUserUi({ showMetricsParameters: showMetricsParameters });
  }
}
