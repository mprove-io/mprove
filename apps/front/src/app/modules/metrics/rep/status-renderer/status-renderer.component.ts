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

  formulaErrorsLength = 0;

  agInit(params: ICellRendererParams<RowData>) {
    this.setTypeErrors(params);
    this.updateSpinner();
  }

  refresh(params: ICellRendererParams<RowData>) {
    this.setTypeErrors(params);
    this.updateSpinner();
    return true;
  }

  setTypeErrors(params: ICellRendererParams<RowData>) {
    this.params = params;
    this.formulaErrorsLength = params.data.records.filter(x =>
      common.isDefined(x.error)
    ).length;
  }

  updateSpinner() {
    if (this.params.data.query?.status === common.QueryStatusEnum.Running) {
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
