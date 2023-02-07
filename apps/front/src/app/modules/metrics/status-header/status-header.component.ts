import { Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

@Component({
  selector: 'm-status-header',
  templateUrl: './status-header.component.html'
})
export class StatusHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  agInit(params: IHeaderParams) {
    this.params = params;
  }

  refresh(params: IHeaderParams) {
    this.params = params;
    return true;
  }
}
