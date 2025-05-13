import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataRow } from '~front/app/interfaces/data-row';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-status-header',
  templateUrl: './status-header.component.html'
})
export class StatusHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams<DataRow>;

  spinnerName = common.makeId();

  isRunning = false;

  agInit(params: IHeaderParams<DataRow>) {
    this.setIsRunning(params);
    this.updateSpinner();
  }

  refresh(params: IHeaderParams<DataRow>) {
    this.setIsRunning(params);
    this.updateSpinner();
    return true;
  }

  setIsRunning(params: IHeaderParams<DataRow>) {
    this.params = params;
    this.isRunning = this.params.column.getColDef().type === 'running';
  }

  updateSpinner() {
    if (this.isRunning === true) {
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
