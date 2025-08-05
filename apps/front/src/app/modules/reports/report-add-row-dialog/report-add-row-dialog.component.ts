import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { tap } from 'rxjs/operators';
import { ChartsQuery } from '~front/app/queries/charts.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { ReportService } from '~front/app/services/report.service';
import { common } from '~front/barrels/common';

export interface ReportAddRowDialogData {
  apiService: ApiService;
}

@Component({
  standalone: false,
  selector: 'm-report-add-row-dialog',
  templateUrl: './report-add-row-dialog.component.html'
})
export class ReportAddRowDialogComponent implements OnInit {
  // @ViewChild('chartSaveAsDialogDashboardSelect', { static: false })
  // chartSaveAsDialogDashboardSelectElement: NgSelectComponent;

  // @HostListener('window:keyup.esc')
  // onEscKeyUp() {
  //   this.chartSaveAsDialogDashboardSelectElement?.close();
  //   // this.ref.close();
  // }

  rowTypeEnum = common.RowTypeEnum;

  rowType: common.RowTypeEnum = common.RowTypeEnum.Empty;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  newNameForm: FormGroup = this.fb.group({
    name: [undefined, [Validators.required]]
  });

  newFormulaForm: FormGroup = this.fb.group({
    formula: [undefined, [Validators.required]]
  });

  // struct: StructState;
  // struct$ = this.structQuery.select().pipe(
  //   tap(x => {
  //     this.struct = x;
  //     this.cd.detectChanges();
  //   })
  // );

  constructor(
    public ref: DialogRef<ReportAddRowDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private reportService: ReportService,
    private uiQuery: UiQuery,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private reportQuery: ReportQuery,
    private chartsQuery: ChartsQuery,
    private structQuery: StructQuery,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  emptyOnClick() {
    this.rowType = common.RowTypeEnum.Empty;
  }

  metricOnClick() {
    this.rowType = common.RowTypeEnum.Metric;
  }

  formulaOnClick() {
    this.rowType = common.RowTypeEnum.Formula;

    this.newNameForm.controls['name'].setValue(undefined);
    this.newNameForm.controls['name'].markAsUntouched();

    this.newFormulaForm.controls['formula'].setValue(undefined);
    this.newFormulaForm.controls['formula'].markAsUntouched();
  }

  headerOnClick() {
    this.rowType = common.RowTypeEnum.Header;

    this.newNameForm.controls['name'].setValue(undefined);
    this.newNameForm.controls['name'].markAsUntouched();
  }

  save() {
    let reportSelectedNodes = this.uiQuery.getValue().reportSelectedNodes;

    let report = this.reportQuery.getValue();

    let rowId =
      reportSelectedNodes.length === 1
        ? reportSelectedNodes[0].data.rowId
        : undefined;

    if (this.rowType === common.RowTypeEnum.Empty) {
      let rowChange: common.RowChange = {
        rowId: rowId,
        rowType: common.RowTypeEnum.Empty,
        showChart: false
      };

      this.reportService.modifyRows({
        report: report,
        changeType: common.ChangeTypeEnum.AddEmpty,
        rowChange: rowChange,
        rowIds: undefined,
        reportFields: report.fields,
        chart: undefined
      });
    } else if (this.rowType === common.RowTypeEnum.Header) {
      this.newNameForm.controls['name'].markAsTouched();

      if (this.newNameForm.valid === false) {
        return;
      }

      let rowChange: common.RowChange = {
        rowId: rowId,
        name: this.newNameForm.controls['name'].value
      };

      this.reportService.modifyRows({
        report: report,
        changeType: common.ChangeTypeEnum.AddHeader,
        rowChange: rowChange,
        rowIds: undefined,
        reportFields: report.fields,
        chart: undefined
      });
    } else if (this.rowType === common.RowTypeEnum.Formula) {
      this.newNameForm.controls['name'].markAsTouched();
      this.newFormulaForm.controls['formula'].markAsTouched();

      if (
        this.newNameForm.valid === false ||
        this.newFormulaForm.valid === false
      ) {
        return;
      }

      let rowChange: common.RowChange = {
        rowId: rowId,
        name: this.newNameForm.controls['name'].value,
        formula: this.newFormulaForm.controls['formula'].value
      };

      this.reportService.modifyRows({
        report: report,
        changeType: common.ChangeTypeEnum.AddFormula,
        rowChange: rowChange,
        rowIds: undefined,
        reportFields: report.fields,
        chart: undefined
      });
    }

    this.ref.close();
  }

  cancel() {
    this.ref.close();
  }
}
