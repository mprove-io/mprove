import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { common } from '~front/barrels/common';
import { RowData } from '../rep.component';

@Component({
  selector: 'm-status-renderer',
  templateUrl: './status-renderer.component.html'
})
export class StatusRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<RowData>;

  spinnerName = common.makeId();
  queryStatusEnum = common.QueryStatusEnum;

  agInit(params: ICellRendererParams<RowData>) {
    // console.log('agInit');
    this.params = params;
    // console.log(params);
    this.updateSpinner();
  }

  refresh(params: ICellRendererParams<RowData>) {
    // console.log('refresh');
    this.params = params;
    this.updateSpinner();
    // As we have updated the params we return true to let AG Grid know we have handled the refresh.
    // So AG Grid will not recreate the cell renderer from scratch.
    return true;
  }

  updateSpinner() {
    if (this.params.data.query.status === common.QueryStatusEnum.Running) {
      // if (this.params.data.query.status === common.QueryStatusEnum.Completed) {
      this.spinner.show(this.spinnerName);
    } else {
      this.spinner.hide(this.spinnerName);
    }
    this.cd.detectChanges();
  }

  constructor(
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}
}
