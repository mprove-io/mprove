import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { SOME_ROWS_HAVE_FORMULA_ERRORS } from '#common/constants/top';
import { DetailUnitEnum } from '#common/enums/detail-unit.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { getTimeSpecDetail } from '#common/functions/get-timespec-detail';
import { makeId } from '#common/functions/make-id';
import { DataRow } from '#common/interfaces/front/data-row';
import { ReportQuery } from '#front/app/queries/report.query';
import { StructQuery } from '#front/app/queries/struct.query';

@Component({
  standalone: false,
  selector: 'm-status-renderer',
  templateUrl: './status-renderer.component.html'
})
export class StatusRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  spinnerName = makeId();
  queryStatusEnum = QueryStatusEnum;

  timeColumnsLimit: number;
  isLimitReached = false;
  isRunning = false;
  topQueryError: string;

  timeSpec: TimeSpecEnum;
  timeSpecDetail: DetailUnitEnum;

  someRowsHaveFormulaErrors = SOME_ROWS_HAVE_FORMULA_ERRORS;

  agInit(params: ICellRendererParams<DataRow>) {
    this.checkParams(params);
    this.updateSpinner();
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.checkParams(params);
    this.updateSpinner();
    return true;
  }

  checkParams(params: ICellRendererParams<DataRow>) {
    this.params = params;

    this.topQueryError =
      params.data.rowType === RowTypeEnum.Formula
        ? params.data.topQueryError
        : undefined;

    this.isRunning =
      this.params.data.query?.status === QueryStatusEnum.Running ||
      (this.params.data.rowType === RowTypeEnum.Formula &&
        this.params.column.getColDef().type === 'running');

    this.timeColumnsLimit = this.reportQuery.getValue().timeColumnsLimit;

    this.timeSpec = this.reportQuery.getValue().timeSpec;
    this.timeSpecDetail = getTimeSpecDetail({
      timeSpec: this.timeSpec,
      weekStart: this.structQuery.getValue().mproveConfig.weekStart
    });

    this.isLimitReached =
      this.params.data.query?.status === QueryStatusEnum.Completed &&
      this.timeSpec === TimeSpecEnum.Timestamps &&
      this.params.data.query.data.length === this.timeColumnsLimit;
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
    private spinner: NgxSpinnerService,
    private reportQuery: ReportQuery,
    private structQuery: StructQuery
  ) {}
}
