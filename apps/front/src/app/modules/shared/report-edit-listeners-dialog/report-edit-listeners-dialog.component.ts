import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChildren
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ModelField } from '~common/_index';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { ReportService } from '~front/app/services/report.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export class RowX2 extends common.Row {
  modelFields?: { [a: string]: common.ModelField[] };
  mconfigListenSwap?: { [a: string]: string[] };
}

export class ReportX2 extends common.ReportX {
  rows: RowX2[];
}

export interface ReportEditListenersDialogData {
  reportService: ReportService;
  apiService: ApiService;
  report: common.Report;
}

@Component({
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

    // this.ref.close();
  }

  spinnerName = 'reportEditListen';

  models: common.Model[];

  report: any; // ReportX2
  reportRows: RowX2[] = [];

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  listenForm: FormGroup = this.fb.group({});

  constructor(
    public ref: DialogRef<ReportEditListenersDialogData>,
    private fb: FormBuilder,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.report = common.makeCopy(this.ref.data.report) as common.ReportX;
    this.reportRows = this.report.rows.filter((row: common.Row) =>
      common.isDefined(row.mconfig)
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

    let payload: apiToBackend.ToBackendGetModelsRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      addFields: true,
      filterByModelIds: this.reportRows.map(row => row.mconfig.modelId)
    };

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModels,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetModelsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.spinner.hide(this.spinnerName);

            this.models = resp.payload.models;

            this.reportRows.forEach((x, rowIndex) => {
              let model = this.models.find(
                m => m.modelId === x.mconfig?.modelId
              );

              let swap: { [a: string]: string[] } = {};

              // Object.keys(x.listen).forEach(modelFieldId => {
              x.parameters
                .filter(p => common.isDefined(p.listen))
                .forEach(p => {
                  let reportFieldId = p.listen;

                  if (common.isUndefined(swap[reportFieldId])) {
                    swap[reportFieldId] = [p.apply_to];
                  } else {
                    swap[reportFieldId].push(p.apply_to);
                  }
                });

              let modelFields: { [a: string]: common.ModelField[] } = {};

              (this.report as ReportX2).fields.forEach(reportField => {
                modelFields[reportField.id] = common.isDefined(
                  reportField.storeResult
                )
                  ? [
                      <ModelField>{ id: undefined },
                      ...model.fields.filter(
                        y =>
                          y.result === reportField.storeResult &&
                          model.modelId === reportField.store
                      )
                    ]
                  : common.isDefined(reportField.storeFilter)
                  ? [
                      <ModelField>{ id: undefined },
                      ...model.fields.filter(y =>
                        y.fieldClass === common.FieldClassEnum.Filter
                          ? y.id === reportField.storeFilter
                          : false
                      )
                    ]
                  : model.isStoreModel === false
                  ? [
                      <ModelField>{ id: undefined },
                      ...model.fields.filter(
                        y => y.result === reportField.result
                      )
                    ]
                  : [<ModelField>{ id: undefined }];

                if (common.isUndefined(swap[reportField.id])) {
                  swap[reportField.id] = [undefined];
                }
              });

              (x as RowX2).modelFields = modelFields;

              (x as RowX2).mconfigListenSwap = swap;

              Object.keys(swap).forEach(dFieldId => {
                swap[dFieldId].forEach((id, ind) => {
                  this.listenForm.addControl(
                    `${rowIndex}-----${dFieldId}-----${ind}`,
                    new FormControl(id)
                  );
                });
              });

              // console.log('modelFields');
              // console.log(modelFields);

              // console.log('swap');
              // console.log(swap);
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
    // console.log(item);

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
      new FormControl(undefined)
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

    let listeners: common.Listener[] = [];

    this.reportRows.forEach(x => {
      Object.keys(x.mconfigListenSwap).forEach(reportFieldId => {
        x.mconfigListenSwap[reportFieldId]
          .filter(y => common.isDefined(y))
          .forEach(modelFieldId => {
            let listener: common.Listener = {
              rowId: x.rowId,
              applyTo: modelFieldId,
              listen: reportFieldId
            };

            listeners.push(listener);
          });
      });

      console.log('listeners');
      console.log(listeners);

      delete x.mconfigListenSwap;
      delete x.modelFields;
    });

    let reportService: ReportService = this.ref.data.reportService;

    reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditListeners,
      rowChange: undefined,
      rowIds: undefined,
      reportFields: this.report.fields,
      listeners: listeners,
      chart: undefined
    });
  }

  cancel() {
    this.ref.close();
  }
}
