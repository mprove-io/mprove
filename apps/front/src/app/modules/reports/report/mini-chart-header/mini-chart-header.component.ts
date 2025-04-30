import { Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

@Component({
  selector: 'm-mini-chart-header',
  templateUrl: './mini-chart-header.component.html'
})
export class MiniChartHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  constructor() {}

  agInit(params: IHeaderParams) {
    this.params = params;
  }

  refresh(params: IHeaderParams) {
    this.params = params;
    return true;
  }
}
