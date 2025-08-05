import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { tap } from 'rxjs/operators';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
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
  @ViewChild('newMetricSelect', { static: false })
  newMetricSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.newMetricSelectElement?.close();
    // this.ref.close();
  }

  rowTypeEnum = common.RowTypeEnum;

  rowType: common.RowTypeEnum = common.RowTypeEnum.Metric;

  newNameForm: FormGroup = this.fb.group({
    name: [undefined, [Validators.required]]
  });

  newFormulaForm: FormGroup = this.fb.group({
    formula: [undefined, [Validators.required]]
  });

  metrics: common.ModelMetric[];
  metrics$ = this.structQuery.select().pipe(
    tap(x => {
      this.metrics = x.metrics;
      this.cd.detectChanges();
    })
  );

  newMetricId: string;

  constructor(
    public ref: DialogRef<ReportAddRowDialogData>,
    private fb: FormBuilder,
    private reportService: ReportService,
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private reportQuery: ReportQuery,
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

  newMetricChange() {
    (document.activeElement as HTMLElement).blur();
  }

  save() {
    if (this.rowType === common.RowTypeEnum.Header) {
      this.newNameForm.controls['name'].markAsTouched();

      if (this.newNameForm.valid === false) {
        return;
      }
    } else if (this.rowType === common.RowTypeEnum.Formula) {
      this.newNameForm.controls['name'].markAsTouched();
      this.newFormulaForm.controls['formula'].markAsTouched();

      if (
        this.newNameForm.valid === false ||
        this.newFormulaForm.valid === false
      ) {
        return;
      }
    } else if (this.rowType === common.RowTypeEnum.Metric) {
      if (common.isUndefined(this.newMetricId)) {
        return;
      }
    }

    let reportSelectedNodes = this.uiQuery.getValue().reportSelectedNodes;

    let report = this.reportQuery.getValue();

    let rowId =
      reportSelectedNodes.length === 1
        ? reportSelectedNodes[0].data.rowId
        : undefined;

    let rowChange: common.RowChange =
      this.rowType === common.RowTypeEnum.Metric
        ? {
            rowId: rowId,
            metricId: this.newMetricId,
            rowType: common.RowTypeEnum.Metric,
            showChart: false
          }
        : this.rowType === common.RowTypeEnum.Formula
          ? {
              rowId: rowId,
              name: this.newNameForm.controls['name'].value,
              formula: this.newFormulaForm.controls['formula'].value,
              showChart: false
            }
          : this.rowType === common.RowTypeEnum.Header
            ? {
                rowId: rowId,
                name: this.newNameForm.controls['name'].value,
                showChart: false
              }
            : this.rowType === common.RowTypeEnum.Empty
              ? {
                  rowId: rowId,
                  rowType: common.RowTypeEnum.Empty,
                  showChart: false
                }
              : undefined;

    this.reportService.modifyRows({
      report: report,
      changeType:
        this.rowType === common.RowTypeEnum.Metric
          ? common.ChangeTypeEnum.AddMetric
          : this.rowType === common.RowTypeEnum.Formula
            ? common.ChangeTypeEnum.AddFormula
            : this.rowType === common.RowTypeEnum.Header
              ? common.ChangeTypeEnum.AddHeader
              : this.rowType === common.RowTypeEnum.Empty
                ? common.ChangeTypeEnum.AddEmpty
                : undefined,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });

    this.ref.close();
  }

  cancel() {
    this.ref.close();
  }

  newMetricSearchFn(term: string, metric: common.ModelMetric) {
    let haystack = [
      `${metric.topLabel} ${metric.partNodeLabel} ${metric.partFieldLabel} by ${metric.timeNodeLabel} ${metric.timeFieldLabel}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }
}
