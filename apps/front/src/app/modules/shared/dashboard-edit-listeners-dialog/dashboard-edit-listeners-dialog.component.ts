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
import { makeId } from '#common/functions/make-id/make-id';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { ToBackendGetModelsRequest } from '#common/types/backend/routes/models/get-models/get-models-request';
import type { ToBackendGetModelsResponse } from '#common/types/backend/routes/models/get-models/get-models-response';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { DashboardX2 } from '#common/types/front/dashboard/dashboard-x-2';
import type { TileX2 } from '#common/types/front/tile/tile-x-2';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { DashboardService } from '#front/app/services/dashboard.service';

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

  listenForm: FormGroup<Record<string, FormControl<string>>> = this.fb.group(
    {}
  );

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

    let payload: ToBackendGetModelsRequest['input'] = {
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
        route: 'api/ToBackendGetModels',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelsResponse) => {
          if (resp.type === 'Success') {
            this.spinner.hide(this.spinnerName);

            this.models = resp.output.models;

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
                            y.fieldClass === 'filter'
                              ? y.id === dashField.storeFilter
                              : false
                          )
                        ]
                      : model.type !== 'Store' &&
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
      new FormControl<string>(undefined)
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
