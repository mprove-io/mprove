import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChildren
} from '@angular/core';
import { FormBuilder, FormControl, type FormGroup } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { EMPTY_MCONFIG_FIELD } from '#common/constants/top-front';

import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { ToBackendGetModelsRequest } from '#common/types/backend/routes/models/get-models/get-models-request';
import type { ToBackendGetModelsResponse } from '#common/types/backend/routes/models/get-models/get-models-response';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { Report } from '#common/types/blockml/parts/report/report';
import type { Listener } from '#common/types/blockml/parts/report/row/listener';
import type { Row } from '#common/types/blockml/parts/report/row/row';
import type { ReportX2 } from '#common/types/front/report/report-x-2';
import type { RowX2 } from '#common/types/front/report/row/row-x-2';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { ReportService } from '#front/app/services/report.service';

export interface ReportEditListenersDialogData {
  reportService: ReportService;
  apiService: ApiService;
  report: Report;
}

@Component({
  standalone: false,
  selector: 'm-report-edit-listeners-dialog',
  templateUrl: './report-edit-listeners-dialog.component.html'
})
export class ReportEditListenersDialogComponent implements OnInit {
  @ViewChildren('fieldSelect')
  fieldSelectElements: NgSelectComponent[];

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fieldSelectElements.forEach(element => {
      element?.close();
    });
  }

  spinnerName = 'reportEditListen';

  models: Model[];

  report: any; // ReportX2
  reportRows: RowX2[] = [];

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  listenForm: FormGroup<Record<string, FormControl<string>>> = this.fb.group(
    {}
  );

  constructor(
    public ref: DialogRef<ReportEditListenersDialogData>,
    private fb: FormBuilder,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.report = makeCopy(this.ref.data.report) as ReportX;
    this.reportRows = this.report.rows.filter((row: Row) =>
      isDefined(row.mconfig)
    );

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(
        tap(x => {
          nav = x;
        }),
        take(1)
      )
      .subscribe();

    this.spinner.show(this.spinnerName);

    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendGetModelsRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      filterByModelIds: this.reportRows.map(row => row.mconfig.modelId)
    };

    apiService
      .req({
        route: 'api/ToBackendGetModels',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelsResponse) => {
          if (resp?.type === 'Success') {
            this.spinner.hide(this.spinnerName);

            this.models = resp.output.models;

            this.reportRows.forEach((x, rowIndex) => {
              let model = this.models.find(
                m => m.modelId === x.mconfig?.modelId
              );

              let swap: { [a: string]: string[] } = {};

              x.parameters
                .filter(p => isDefined(p.listen))
                .forEach(p => {
                  let reportFieldId = p.listen;

                  if (isUndefined(swap[reportFieldId])) {
                    swap[reportFieldId] = [p.apply_to];
                  } else {
                    swap[reportFieldId].push(p.apply_to);
                  }
                });

              let modelFields: { [a: string]: ModelField[] } = {};

              let emptyField = <ModelField>{
                id: undefined,
                topLabel: EMPTY_MCONFIG_FIELD.topLabel
              };

              (this.report as ReportX2).fields.forEach(reportField => {
                modelFields[reportField.id] =
                  isDefined(reportField.storeResult) &&
                  reportField.storeModel === model.modelId
                    ? [
                        emptyField,
                        ...model.fields.filter(
                          y =>
                            y.result === reportField.storeResult &&
                            model.modelId === reportField.storeModel
                        )
                      ]
                    : isDefined(reportField.storeFilter) &&
                        reportField.storeModel === model.modelId
                      ? [
                          emptyField,
                          ...model.fields.filter(y =>
                            y.fieldClass === 'filter'
                              ? y.id === reportField.storeFilter
                              : false
                          )
                        ]
                      : model.type !== 'Store' &&
                          isUndefined(reportField.storeModel)
                        ? [
                            emptyField,
                            ...model.fields.filter(
                              y => y.result === reportField.result
                            )
                          ]
                        : [emptyField];

                if (isUndefined(swap[reportField.id])) {
                  swap[reportField.id] = [undefined];
                }
              });

              (x as RowX2).modelFields = modelFields;

              (x as RowX2).mconfigListenSwap = swap;

              Object.keys(swap).forEach(dFieldId => {
                swap[dFieldId].forEach((id, ind) => {
                  this.listenForm.addControl(
                    `${rowIndex}-----${dFieldId}-----${ind}`,
                    new FormControl<string>(id)
                  );
                });
              });
            });

            this.cd.detectChanges();
          }
        })
      )
      .toPromise();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  listenerChange(item: {
    row: RowX2;
    rowIndex: number;
    reportFieldId: string;
    i: number;
    items: any;
    selected: any;
  }) {
    let { reportFieldId, row, rowIndex, i, items, selected } = item;

    row.mconfigListenSwap[reportFieldId][i] =
      this.listenForm.controls[
        `${rowIndex}-----${reportFieldId}-----${i}`
      ].value;
  }

  addListener(item: { row: RowX2; rowIndex: number; reportFieldId: string }) {
    let { row, rowIndex, reportFieldId } = item;

    this.listenForm.addControl(
      `${rowIndex}-----${reportFieldId}-----${row.mconfigListenSwap[reportFieldId].length}`,
      new FormControl<string>(undefined)
    );

    row.mconfigListenSwap[reportFieldId].push(undefined);
  }

  removeListener(item: {
    event: MouseEvent;
    row: RowX2;
    rowIndex: number;
    index: number;
    reportFieldId: string;
  }) {
    let { event, row, rowIndex, index, reportFieldId } = item;

    event.stopPropagation();

    let mappings = row.mconfigListenSwap[reportFieldId];

    let newMappings = [
      ...mappings.slice(0, index),
      ...mappings.slice(index + 1)
    ];

    row.mconfigListenSwap[reportFieldId] = newMappings;

    this.listenForm.removeControl(
      `${rowIndex}-----${reportFieldId}-----${index}`
    );
  }

  apply() {
    this.ref.close();

    let listeners: Listener[] = [];

    this.reportRows.forEach(x => {
      Object.keys(x.mconfigListenSwap).forEach(reportFieldId => {
        x.mconfigListenSwap[reportFieldId]
          .filter(y => isDefined(y))
          .forEach(modelFieldId => {
            let listener: Listener = {
              rowId: x.rowId,
              applyTo: modelFieldId,
              listen: reportFieldId
            };

            listeners.push(listener);
          });
      });

      delete x.mconfigListenSwap;
      delete x.modelFields;
    });

    let reportService: ReportService = this.ref.data.reportService;

    reportService.modifyRows({
      report: this.report,
      changeType: 'EditListeners',
      rowChange: undefined,
      rowIds: undefined,
      reportFields: this.report.fields,
      listeners: listeners,
      chart: undefined
    });
  }

  fieldSearchFn(term: string, modelField: ModelField) {
    let haystack = [
      isDefinedAndNotEmpty(modelField.groupLabel)
        ? `${modelField.topLabel} ${modelField.groupLabel} - ${modelField.label}`
        : `${modelField.topLabel} ${modelField.label}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  cancel() {
    this.ref.close();
  }
}
