import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ModelField } from '~common/_index';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { SharedModule } from '../../shared/shared.module';

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
  templateUrl: './dashboard-edit-listeners-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, NgSelectModule, SharedModule]
})
export class DashboardEditListenersDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
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

  constructor(
    public ref: DialogRef<DashboardEditListenersDialogData>,
    private fb: FormBuilder,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
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

    // await common.sleep(5000);

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

            (this.dashboard as DashboardX2).tiles.forEach(x => {
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

              (this.dashboard as DashboardX2).fields.forEach(f => {
                modelFields[f.id] = [
                  <ModelField>{ id: undefined },
                  ...model.fields.filter(y => y.result === f.result)
                ];

                if (common.isUndefined(swap[f.id])) {
                  swap[f.id] = [undefined];
                }
              });

              (x as TileX2).modelFields = modelFields;

              (x as TileX2).mconfigListenSwap = swap;
            });

            // console.log(this.dashboard.tiles);
            this.cd.detectChanges();
          }
        })
      )
      .toPromise();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  fieldChange() {}

  addListener(tile: TileX2, dashboardFieldId: string) {
    tile.mconfigListenSwap[dashboardFieldId].push(undefined);
  }

  removeListener(
    event: MouseEvent,
    tile: TileX2,
    dashboardFieldId: string,
    index: number
  ) {
    event.stopPropagation();

    let mappings = tile.mconfigListenSwap[dashboardFieldId];

    let newMappings = [
      ...mappings.slice(0, index),
      ...mappings.slice(index + 1)
    ];

    tile.mconfigListenSwap[dashboardFieldId] = newMappings;
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
      deleteFilterMconfigId: undefined
    });
  }

  cancel() {
    this.ref.close();
  }
}
