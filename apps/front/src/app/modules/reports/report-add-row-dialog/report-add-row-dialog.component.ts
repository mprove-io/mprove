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
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';

import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ModelMetricX } from '#common/types/backend/parts/model/model-metric-x';
import type { RowChange } from '#common/types/blockml/parts/report/row/row-change';
import type { RowType } from '#common/types/blockml/parts/report/row/row-type';
import { MemberQuery } from '#front/app/queries/member.query';
import { ModelsQuery } from '#front/app/queries/models.query';
import { ReportQuery } from '#front/app/queries/report.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { ReportService } from '#front/app/services/report.service';

export interface ReportAddRowDialogData {
  apiService: ApiService;
}

@Component({
  standalone: false,
  selector: 'm-report-add-row-dialog',
  templateUrl: './report-add-row-dialog.component.html'
})
export class ReportAddRowDialogComponent implements OnInit {
  readonly namedRowTypes: RowType[] = ['header', 'formula'];

  @ViewChild('newMetricSelect', { static: false })
  newMetricSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  rowType: RowType = 'metric';

  newNameForm: FormGroup = this.fb.group({
    name: [undefined, [Validators.required]]
  });

  newFormulaForm: FormGroup = this.fb.group({
    formula: [undefined, [Validators.required]]
  });

  metrics: ModelMetricX[];
  metricsHasAccess$ = combineLatest([this.structQuery.metrics$]).pipe(
    tap(([metrics]: [ModelMetricX[]]) => {
      this.metrics = metrics.filter(metric => metric.hasAccessToModel === true);
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
    private memberQuery: MemberQuery,
    private modelsQuery: ModelsQuery,
    private reportQuery: ReportQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  emptyOnClick() {
    this.rowType = 'empty';
  }

  metricOnClick() {
    this.rowType = 'metric';
  }

  formulaOnClick() {
    this.rowType = 'formula';

    this.newNameForm.controls['name'].setValue(undefined);
    this.newNameForm.controls['name'].markAsUntouched();

    this.newFormulaForm.controls['formula'].setValue(undefined);
    this.newFormulaForm.controls['formula'].markAsUntouched();
  }

  headerOnClick() {
    this.rowType = 'header';

    this.newNameForm.controls['name'].setValue(undefined);
    this.newNameForm.controls['name'].markAsUntouched();
  }

  newMetricChange() {
    (document.activeElement as HTMLElement).blur();
  }

  save() {
    if (this.rowType === 'header') {
      this.newNameForm.controls['name'].markAsTouched();

      if (this.newNameForm.valid === false) {
        return;
      }
    } else if (this.rowType === 'formula') {
      this.newNameForm.controls['name'].markAsTouched();
      this.newFormulaForm.controls['formula'].markAsTouched();

      if (
        this.newNameForm.valid === false ||
        this.newFormulaForm.valid === false
      ) {
        return;
      }
    } else if (this.rowType === 'metric') {
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
      this.rowType === 'metric'
        ? {
            rowId: rowId,
            metricId: this.newMetricId,
            rowType: 'metric',
            showChart: false
          }
        : this.rowType === 'formula'
          ? {
              rowId: rowId,
              name: this.newNameForm.controls['name'].value,
              formula: this.newFormulaForm.controls['formula'].value,
              showChart: false
            }
          : this.rowType === 'header'
            ? {
                rowId: rowId,
                name: this.newNameForm.controls['name'].value,
                showChart: false
              }
            : this.rowType === 'empty'
              ? {
                  rowId: rowId,
                  rowType: 'empty',
                  showChart: false
                }
              : undefined;

    this.reportService.modifyRows({
      report: report,
      changeType:
        this.rowType === 'metric'
          ? 'AddMetric'
          : this.rowType === 'formula'
            ? 'AddFormula'
            : this.rowType === 'header'
              ? 'AddHeader'
              : this.rowType === 'empty'
                ? 'AddEmpty'
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

  newMetricSearchFn(term: string, metric: ModelMetricX) {
    let haystack = [
      `${metric.topLabel} ${metric.partNodeLabel} ${metric.partFieldLabel} by ${metric.timeNodeLabel} ${metric.timeFieldLabel} ${metric.connectionType}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }
}
