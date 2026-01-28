import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams, IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs';
import { ReportX } from '#common/interfaces/backend/report-x';
import { DataRow } from '#common/interfaces/front/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { ReportService } from '~front/app/services/report.service';
import { UiService } from '~front/app/services/ui.service';

@Component({
  standalone: false,
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

  showMetricsParameters = false;
  showMetricsModelName = false;
  showMetricsTimeFieldName = false;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showMetricsModelName = x.showMetricsModelName;
      this.showMetricsTimeFieldName = x.showMetricsTimeFieldName;
      this.showMetricsParameters = x.showMetricsParameters;

      this.cd.detectChanges();
    })
  );

  report: ReportX;
  report$ = this.reportQuery.select().pipe(
    tap(x => {
      this.report = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private uiService: UiService,
    private myDialogService: MyDialogService,
    private reportService: ReportService,
    private apiService: ApiService,
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

  toggleShowMetricsModelName() {
    this.uiQuery.updatePart({
      showMetricsModelName: !this.showMetricsModelName
    });
  }

  toggleShowMetricsTimeFieldName() {
    this.uiQuery.updatePart({
      showMetricsTimeFieldName: !this.showMetricsTimeFieldName
    });
  }

  toggleShowMetricsParameters() {
    this.uiQuery.updatePart({
      showMetricsParameters: !this.showMetricsParameters
    });
  }

  editListeners() {
    this.myDialogService.showReportEditListeners({
      reportService: this.reportService,
      apiService: this.apiService,
      report: this.report
    });
  }
}
