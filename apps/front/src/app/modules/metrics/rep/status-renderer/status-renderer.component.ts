import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { common } from '~front/barrels/common';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-status-renderer',
  templateUrl: './status-renderer.component.html'
})
export class StatusRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  spinnerName = common.makeId();
  queryStatusEnum = common.QueryStatusEnum;

  formulaErrorsLength = 0;

  agInit(params: ICellRendererParams<DataRow>) {
    this.setTypeErrors(params);
    this.updateSpinner();
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.setTypeErrors(params);
    this.updateSpinner();
    return true;
  }

  setTypeErrors(params: ICellRendererParams<DataRow>) {
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
