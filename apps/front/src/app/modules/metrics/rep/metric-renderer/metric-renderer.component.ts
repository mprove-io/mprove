import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { tap } from 'rxjs';
import { UiQuery } from '~front/app/queries/ui.query';
import { common } from '~front/barrels/common';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-metric-renderer',
  templateUrl: './metric-renderer.component.html'
})
export class MetricRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  rowTypeHeader = common.RowTypeEnum.Header;
  rowTypeMetric = common.RowTypeEnum.Metric;
  rowTypeFormula = common.RowTypeEnum.Formula;

  agInit(params: ICellRendererParams<DataRow>) {
    this.params = params;
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.params = params;
    return true;
  }

  showMetricsModelName = false;
  showMetricsTimeFieldName = false;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showMetricsModelName = x.showMetricsModelName;
      this.showMetricsTimeFieldName = x.showMetricsTimeFieldName;

      this.cd.detectChanges();
    })
  );

  constructor(private cd: ChangeDetectorRef, private uiQuery: UiQuery) {}
}
