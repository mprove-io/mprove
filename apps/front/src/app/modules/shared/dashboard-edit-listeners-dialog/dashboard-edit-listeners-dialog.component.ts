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
import { DashboardService } from '~front/app/services/dashboard.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export class TileX2 extends common.TileX {
  modelFields?: { [a: string]: common.ModelField[] };
  mconfigListenSwap?: { [a: string]: string[] };
}

export class DashboardX2 extends common.DashboardX {
  tiles: TileX2[];
}

export interface DashboardEditListenersDialogData {
  dashboardService: DashboardService;
  apiService: ApiService;
  dashboard: common.Dashboard;
}

@Component({
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

    // this.ref.close();
  }

  spinnerName = 'dashboardEditListen';

  models: common.Model[];

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
    this.dashboard = common.makeCopy(
      this.ref.data.dashboard
    ) as common.DashboardX;

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
      filterByModelIds: (this.dashboard as DashboardX2).tiles.map(
        tile => tile.modelId
      )
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

            (this.dashboard as DashboardX2).tiles.forEach((x, tileIndex) => {
              let model = this.models.find(m => m.modelId === x.modelId);

              let swap: { [a: string]: string[] } = {};

              Object.keys(x.listen).forEach(modelFieldId => {
                let dashboardFieldId = x.listen[modelFieldId];

                if (common.isUndefined(swap[dashboardFieldId])) {
                  swap[dashboardFieldId] = [modelFieldId];
                } else {
                  swap[dashboardFieldId].push(modelFieldId);
                }
              });

              let modelFields: { [a: string]: common.ModelField[] } = {};

              (this.dashboard as DashboardX2).fields.forEach(dashField => {
                modelFields[dashField.id] =
                  common.isDefined(dashField.storeResult) &&
                  dashField.store === model.modelId
                    ? [
                        <ModelField>{ id: undefined },
                        ...model.fields.filter(
                          y =>
                            y.result === dashField.storeResult &&
                            model.modelId === dashField.store
                        )
                      ]
                    : common.isDefined(dashField.storeFilter) &&
                      dashField.store === model.modelId
                    ? [
                        <ModelField>{ id: undefined },
                        ...model.fields.filter(y =>
                          y.fieldClass === common.FieldClassEnum.Filter
                            ? y.id === dashField.storeFilter
                            : false
                        )
                      ]
                    : model.isStoreModel === false &&
                      common.isUndefined(dashField.store)
                    ? [
                        <ModelField>{ id: undefined },
                        ...model.fields.filter(
                          y => y.result === dashField.result
                        )
                      ]
                    : [<ModelField>{ id: undefined }];

                if (common.isUndefined(swap[dashField.id])) {
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
    tile: TileX2;
    tileIndex: number;
    dashboardFieldId: string;
    i: number;
    items: any;
    selected: any;
  }) {
    // console.log(item);

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
          .filter(y => common.isDefined(y))
          .forEach(modelFieldId => {
            newListen[modelFieldId] = dashboardFieldId;
          });
      });

      x.listen = newListen;

      delete x.mconfigListenSwap;
      delete x.modelFields;
    });

    let dashboardService: DashboardService = this.ref.data.dashboardService;

    dashboardService.navCreateTempDashboard({
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: this.dashboard.fields,
      deleteFilterFieldId: undefined,
      deleteFilterTileTitle: undefined,
      timezone: this.uiQuery.getValue().timezone
    });
  }

  cancel() {
    this.ref.close();
  }
}
