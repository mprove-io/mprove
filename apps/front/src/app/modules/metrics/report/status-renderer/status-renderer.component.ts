import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataRow } from '~front/app/interfaces/data-row';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-status-renderer',
  templateUrl: './status-renderer.component.html'
})
export class StatusRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  spinnerName = common.makeId();
  queryStatusEnum = common.QueryStatusEnum;

  isRunning = false;
  topQueryError: string;

  someRowsHaveFormulaErrors = common.SOME_ROWS_HAVE_FORMULA_ERRORS;

  agInit(params: ICellRendererParams<DataRow>) {
    this.setIsRunning(params);
    this.updateSpinner();
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.setIsRunning(params);
    this.updateSpinner();
    return true;
  }

  setIsRunning(params: ICellRendererParams<DataRow>) {
    this.params = params;

    this.topQueryError =
      params.data.rowType === common.RowTypeEnum.Formula
        ? params.data.topQueryError
        : undefined;

    this.isRunning =
      this.params.data.query?.status === common.QueryStatusEnum.Running ||
      (this.params.data.rowType === common.RowTypeEnum.Formula &&
        this.params.column.getColDef().type === 'running');
  }

  updateSpinner() {
    if (this.isRunning) {
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
