import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams, IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { UiService } from '~front/app/services/ui.service';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-metric-header',
  templateUrl: './metric-header.component.html'
})
export class MetricHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  repSelectedNodes: IRowNode<DataRow>[] = [];
  repSelectedNodes$ = this.uiQuery.repSelectedNodes$.pipe(
    tap(x => {
      this.repSelectedNodes = x;
      this.cd.detectChanges();
    })
  );

  showMetricsModelName = false;
  showMetricsTimeFieldName = false;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showMetricsModelName = x.showMetricsModelName;
      this.showMetricsTimeFieldName = x.showMetricsTimeFieldName;

      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private uiService: UiService,
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  agInit(params: IHeaderParams) {
    this.params = params;
  }

  refresh(params: IHeaderParams) {
    this.params = params;
    return true;
  }

  esc() {
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

  addRow() {
    this.myDialogService.showAddRow({
      apiService: this.apiService
      // ,
      // reps: this.reps.filter(
      //   x => x.draft === false && x.repId !== common.EMPTY_REP_ID
      // ),
      // rep: this.rep
    });
  }
}
