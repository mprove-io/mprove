import { Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

@Component({
  selector: 'm-row-id-header',
  templateUrl: './row-id-header.component.html'
})
export class RowIdHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  agInit(params: IHeaderParams) {
    this.params = params;
  }

  refresh(params: IHeaderParams) {
    this.params = params;
    return true;
  }
}
