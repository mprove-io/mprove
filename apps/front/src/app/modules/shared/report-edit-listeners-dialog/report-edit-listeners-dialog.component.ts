import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChildren
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { EMPTY_MCONFIG_FIELD } from '~common/constants/top-front';
import { ChangeTypeEnum } from '~common/enums/change-type.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { ReportX } from '~common/interfaces/backend/report-x';
import { Listener } from '~common/interfaces/blockml/listener';
import { Model } from '~common/interfaces/blockml/model';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { Report } from '~common/interfaces/blockml/report';
import { Row } from '~common/interfaces/blockml/row';
import {
  ToBackendGetModelsRequestPayload,
  ToBackendGetModelsResponse
} from '~common/interfaces/to-backend/models/to-backend-get-models';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { ReportService } from '~front/app/services/report.service';

export class RowX2 extends Row {
  modelFields?: { [a: string]: ModelField[] };
  mconfigListenSwap?: { [a: string]: string[] };
}

export class ReportX2 extends ReportX {
  rows: RowX2[];
}

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

  rowTypeMetric = RowTypeEnum.Metric;

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

    let payload: ToBackendGetModelsRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      filterByModelIds: this.reportRows.map(row => row.mconfig.modelId)
    };

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetModels,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.spinner.hide(this.spinnerName);

            this.models = resp.payload.models;

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
                            y.fieldClass === FieldClassEnum.Filter
                              ? y.id === reportField.storeFilter
                              : false
                          )
                        ]
                      : model.type !== ModelTypeEnum.Store &&
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
                    new FormControl(id)
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
      changeType: ChangeTypeEnum.EditListeners,
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
