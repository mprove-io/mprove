import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams, IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs';
import { UiQuery } from '~front/app/queries/ui.query';
import { UiService } from '~front/app/services/ui.service';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-metric-header',
  templateUrl: './metric-header.component.html'
})
export class MetricHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

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
    private cd: ChangeDetectorRef
  ) {}

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
}
