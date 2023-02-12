import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { RowData } from '../rep.component';

@Component({
  selector: 'm-metric-renderer',
  templateUrl: './metric-renderer.component.html'
})
export class MetricRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<RowData>;

  agInit(params: ICellRendererParams<RowData>) {
    this.params = params;
  }

  refresh(params: ICellRendererParams<RowData>) {
    this.params = params;
    return true;
  }

  constructor(private cd: ChangeDetectorRef) {}
}
