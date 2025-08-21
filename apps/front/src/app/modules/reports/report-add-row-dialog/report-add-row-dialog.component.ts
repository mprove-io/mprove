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
    // this.newMetricSelectElement?.close();
    this.ref.close();
  }

  rowTypeEnum = RowTypeEnum;

  rowType: RowTypeEnum = RowTypeEnum.Metric;

  newNameForm: FormGroup = this.fb.group({
    name: [undefined, [Validators.required]]
  });

  newFormulaForm: FormGroup = this.fb.group({
    formula: [undefined, [Validators.required]]
  });

  metrics: ModelMetric[];
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
    this.rowType = RowTypeEnum.Empty;
  }

  metricOnClick() {
    this.rowType = RowTypeEnum.Metric;
  }

  formulaOnClick() {
    this.rowType = RowTypeEnum.Formula;

    this.newNameForm.controls['name'].setValue(undefined);
    this.newNameForm.controls['name'].markAsUntouched();

    this.newFormulaForm.controls['formula'].setValue(undefined);
    this.newFormulaForm.controls['formula'].markAsUntouched();
  }

  headerOnClick() {
    this.rowType = RowTypeEnum.Header;

    this.newNameForm.controls['name'].setValue(undefined);
    this.newNameForm.controls['name'].markAsUntouched();
  }

  newMetricChange() {
    (document.activeElement as HTMLElement).blur();
  }

  save() {
    if (this.rowType === RowTypeEnum.Header) {
      this.newNameForm.controls['name'].markAsTouched();

      if (this.newNameForm.valid === false) {
        return;
      }
    } else if (this.rowType === RowTypeEnum.Formula) {
      this.newNameForm.controls['name'].markAsTouched();
      this.newFormulaForm.controls['formula'].markAsTouched();

      if (
        this.newNameForm.valid === false ||
        this.newFormulaForm.valid === false
      ) {
        return;
      }
    } else if (this.rowType === RowTypeEnum.Metric) {
      if (isUndefined(this.newMetricId)) {
        return;
      }
    }

    let reportSelectedNodes = this.uiQuery.getValue().reportSelectedNodes;

    let report = this.reportQuery.getValue();

    let rowId =
      reportSelectedNodes.length === 1
        ? reportSelectedNodes[0].data.rowId
        : undefined;

    let rowChange: RowChange =
      this.rowType === RowTypeEnum.Metric
        ? {
            rowId: rowId,
            metricId: this.newMetricId,
            rowType: RowTypeEnum.Metric,
            showChart: false
          }
        : this.rowType === RowTypeEnum.Formula
          ? {
              rowId: rowId,
              name: this.newNameForm.controls['name'].value,
              formula: this.newFormulaForm.controls['formula'].value,
              showChart: false
            }
          : this.rowType === RowTypeEnum.Header
            ? {
                rowId: rowId,
                name: this.newNameForm.controls['name'].value,
                showChart: false
              }
            : this.rowType === RowTypeEnum.Empty
              ? {
                  rowId: rowId,
                  rowType: RowTypeEnum.Empty,
                  showChart: false
                }
              : undefined;

    this.reportService.modifyRows({
      report: report,
      changeType:
        this.rowType === RowTypeEnum.Metric
          ? ChangeTypeEnum.AddMetric
          : this.rowType === RowTypeEnum.Formula
            ? ChangeTypeEnum.AddFormula
            : this.rowType === RowTypeEnum.Header
              ? ChangeTypeEnum.AddHeader
              : this.rowType === RowTypeEnum.Empty
                ? ChangeTypeEnum.AddEmpty
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

  newMetricSearchFn(term: string, metric: ModelMetric) {
    let haystack = [
      `${metric.topLabel} ${metric.partNodeLabel} ${metric.partFieldLabel} by ${metric.timeNodeLabel} ${metric.timeFieldLabel}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }
}
