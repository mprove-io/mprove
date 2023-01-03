import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ModelField } from '~common/_index';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export class ReportX2 extends common.ReportX {
  modelFields?: { [a: string]: common.ModelField[] };
  mconfigListenSwap?: { [a: string]: string[] };
}

export class DashboardX2 extends common.DashboardX {
  reports: ReportX2[];
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
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  spinnerName = 'dashboardEditListen';

  models: common.Model[];

  dashboard: DashboardX2;

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
      filterByModelIds: this.dashboard.reports.map(report => report.modelId)
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

            this.dashboard.reports.forEach(x => {
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

              this.dashboard.fields.forEach(f => {
                modelFields[f.id] = [
                  <ModelField>{ id: undefined },
                  ...model.fields.filter(y => y.result === f.result)
                ];

                if (common.isUndefined(swap[f.id])) {
                  swap[f.id] = [undefined];
                }
              });

              (x as ReportX2).modelFields = modelFields;

              (x as ReportX2).mconfigListenSwap = swap;
            });

            // console.log(this.dashboard.reports);
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

  addListener(report: ReportX2, dashboardFieldId: string) {
    report.mconfigListenSwap[dashboardFieldId].push(undefined);
  }

  removeListener(
    event: MouseEvent,
    report: ReportX2,
    dashboardFieldId: string,
    index: number
  ) {
    event.stopPropagation();

    let mappings = report.mconfigListenSwap[dashboardFieldId];

    let newMappings = [
      ...mappings.slice(0, index),
      ...mappings.slice(index + 1)
    ];

    report.mconfigListenSwap[dashboardFieldId] = newMappings;
  }

  apply() {
    this.ref.close();

    this.dashboard.reports.forEach(x => {
      let newListen: { [a: string]: string } = {};

      Object.keys(x.mconfigListenSwap).forEach(dashboardFieldId => {
        x.mconfigListenSwap[dashboardFieldId]
          .filter(z => common.isDefined(z))
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
      reports: this.dashboard.reports,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: this.dashboard.fields
    });
  }

  cancel() {
    this.ref.close();
  }
}
