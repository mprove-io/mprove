import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-row-id-renderer',
  templateUrl: './row-id-renderer.component.html'
})
export class RowIdRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  agInit(params: ICellRendererParams<DataRow>) {
    this.params = params;
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.params = params;
    return true;
  }
}
