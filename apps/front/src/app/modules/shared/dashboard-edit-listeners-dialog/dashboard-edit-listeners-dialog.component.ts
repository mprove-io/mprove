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
import { EMPTY_MCONFIG_FIELD } from '#common/constants/top-front';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { makeCopy } from '#common/functions/make-copy';
import { makeId } from '#common/functions/make-id';
import { DashboardX } from '#common/interfaces/backend/dashboard-x';
import { TileX } from '#common/interfaces/backend/tile-x';
import { Dashboard } from '#common/interfaces/blockml/dashboard';
import { Model } from '#common/interfaces/blockml/model';
import { ModelField } from '#common/interfaces/blockml/model-field';
import {
  ToBackendGetModelsRequestPayload,
  ToBackendGetModelsResponse
} from '#common/interfaces/to-backend/models/to-backend-get-models';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { DashboardService } from '#front/app/services/dashboard.service';

export class TileX2 extends TileX {
  modelFields?: { [a: string]: ModelField[] };
  mconfigListenSwap?: { [a: string]: string[] };
}

export class DashboardX2 extends DashboardX {
  tiles: TileX2[];
}

export interface DashboardEditListenersDialogData {
  dashboardService: DashboardService;
  apiService: ApiService;
  dashboard: Dashboard;
}

@Component({
  standalone: false,
  selector: 'm-dashboard-edit-listeners-dialog',
  templateUrl: './dashboard-edit-listeners-dialog.component.html'
})
export class DashboardEditListenersDialogComponent implements OnInit {
  @ViewChildren('fieldSelect')
  fieldSelectElements: NgSelectComponent[];

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fieldSelectElements.forEach(element => {
      element?.close();
    });
  }

  spinnerName = 'dashboardEditListen';

  models: Model[];

  dashboard: any; // DashboardX2

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  listenForm: FormGroup = this.fb.group({});

  constructor(
    public ref: DialogRef<DashboardEditListenersDialogData>,
    private fb: FormBuilder,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.dashboard = makeCopy(this.ref.data.dashboard) as DashboardX;

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
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      filterByModelIds: (this.dashboard as DashboardX2).tiles.map(
        tile => tile.modelId
      )
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

            (this.dashboard as DashboardX2).tiles.forEach((x, tileIndex) => {
              let model = this.models.find(m => m.modelId === x.modelId);

              let swap: { [a: string]: string[] } = {};

              Object.keys(x.listen).forEach(modelFieldId => {
                let dashboardFieldId = x.listen[modelFieldId];

                if (isUndefined(swap[dashboardFieldId])) {
                  swap[dashboardFieldId] = [modelFieldId];
                } else {
                  swap[dashboardFieldId].push(modelFieldId);
                }
              });

              let modelFields: { [a: string]: ModelField[] } = {};

              let emptyField = <ModelField>{
                id: undefined,
                topLabel: EMPTY_MCONFIG_FIELD.topLabel
              };

              (this.dashboard as DashboardX2).fields.forEach(dashField => {
                modelFields[dashField.id] =
                  isDefined(dashField.storeResult) &&
                  dashField.storeModel === model.modelId
                    ? [
                        emptyField,
                        ...model.fields.filter(
                          y =>
                            y.result === dashField.storeResult &&
                            model.modelId === dashField.storeModel
                        )
                      ]
                    : isDefined(dashField.storeFilter) &&
                        dashField.storeModel === model.modelId
                      ? [
                          emptyField,
                          ...model.fields.filter(y =>
                            y.fieldClass === FieldClassEnum.Filter
                              ? y.id === dashField.storeFilter
                              : false
                          )
                        ]
                      : model.type !== ModelTypeEnum.Store &&
                          isUndefined(dashField.storeModel)
                        ? [
                            emptyField,
                            ...model.fields.filter(
                              y => y.result === dashField.result
                            )
                          ]
                        : [emptyField];

                if (isUndefined(swap[dashField.id])) {
                  swap[dashField.id] = [undefined];
                }
              });

              (x as TileX2).modelFields = modelFields;

              (x as TileX2).mconfigListenSwap = swap;

              Object.keys(swap).forEach(dFieldId => {
                swap[dFieldId].forEach((id, ind) => {
                  this.listenForm.addControl(
                    `${tileIndex}-----${dFieldId}-----${ind}`,
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
    tile: TileX2;
    tileIndex: number;
    dashboardFieldId: string;
    i: number;
    items: any;
    selected: any;
  }) {
    let { dashboardFieldId, tile, tileIndex, i, items, selected } = item;

    tile.mconfigListenSwap[dashboardFieldId][i] =
      this.listenForm.controls[
        `${tileIndex}-----${dashboardFieldId}-----${i}`
      ].value;
  }

  addListener(item: {
    tile: TileX2;
    tileIndex: number;
    dashboardFieldId: string;
  }) {
    let { tile, tileIndex, dashboardFieldId } = item;

    this.listenForm.addControl(
      `${tileIndex}-----${dashboardFieldId}-----${tile.mconfigListenSwap[dashboardFieldId].length}`,
      new FormControl(undefined)
    );

    tile.mconfigListenSwap[dashboardFieldId].push(undefined);
  }

  removeListener(item: {
    event: MouseEvent;
    tile: TileX2;
    tileIndex: number;
    index: number;
    dashboardFieldId: string;
  }) {
    let { event, tile, tileIndex, index, dashboardFieldId } = item;

    event.stopPropagation();

    let mappings = tile.mconfigListenSwap[dashboardFieldId];

    let newMappings = [
      ...mappings.slice(0, index),
      ...mappings.slice(index + 1)
    ];

    tile.mconfigListenSwap[dashboardFieldId] = newMappings;

    this.listenForm.removeControl(
      `${tileIndex}-----${dashboardFieldId}-----${index}`
    );
  }

  apply() {
    this.ref.close();

    (this.dashboard as DashboardX2).tiles.forEach(x => {
      let newListen: { [a: string]: string } = {};

      Object.keys(x.mconfigListenSwap).forEach(dashboardFieldId => {
        x.mconfigListenSwap[dashboardFieldId]
          .filter(y => isDefined(y))
          .forEach(modelFieldId => {
            newListen[modelFieldId] = dashboardFieldId;
          });
      });

      x.listen = newListen;

      delete x.mconfigListenSwap;
      delete x.modelFields;
    });

    let dashboardService: DashboardService = this.ref.data.dashboardService;

    dashboardService.editDashboard({
      isDraft: this.dashboard.draft,
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: makeId(),
      newDashboardFields: this.dashboard.fields,
      timezone: this.uiQuery.getValue().timezone,
      isQueryCache: false,
      cachedQueryMconfigIds: []
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
