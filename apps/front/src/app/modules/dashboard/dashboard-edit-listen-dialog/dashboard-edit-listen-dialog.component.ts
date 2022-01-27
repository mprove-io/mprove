import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { NavState } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export class ReportX2 extends common.ReportX {
  modelFields?: { [a: string]: common.ModelField[] };
  mconfigListenSwap?: { [a: string]: string[] };
}

export class DashboardX2 extends common.DashboardX {
  reports: ReportX2[];
}

@Component({
  selector: 'm-dashboard-edit-listen-dialog',
  templateUrl: './dashboard-edit-listen-dialog.component.html'
})
export class DashboardEditListenDialogComponent implements OnInit {
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
    public ref: DialogRef,
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
      addFields: true,
      filterByModelIds: this.dashboard.reports.map(report => report.modelId)
    };

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModels,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendGetModelsResponse) => {
          this.spinner.hide(this.spinnerName);

          this.models = resp.payload.models;

          this.dashboard.reports.forEach(x => {
            let model = this.models.find(m => m.modelId === x.modelId);

            let swap: { [a: string]: string[] } = {};

            Object.keys(x.mconfig.listen).forEach(modelFieldId => {
              let dashboardFieldId = x.mconfig.listen[modelFieldId];

              if (common.isUndefined(swap[dashboardFieldId])) {
                swap[dashboardFieldId] = [modelFieldId];
              } else {
                swap[dashboardFieldId].push(modelFieldId);
              }
            });

            let modelFields: { [a: string]: common.ModelField[] } = {};

            this.dashboard.fields.forEach(f => {
              modelFields[f.id] = model.fields.filter(
                y => y.result === f.result
              );

              if (common.isUndefined(swap[f.id])) {
                swap[f.id] = [undefined];
              }
            });

            (x as ReportX2).modelFields = modelFields;

            (x as ReportX2).mconfigListenSwap = swap;
          });

          console.log(this.dashboard.reports);

          this.cd.detectChanges();
        })
      )
      .toPromise();
  }

  save() {
    this.ref.close();

    let dashboardService: DashboardService = this.ref.data.dashboardService;

    dashboardService.navCreateTempDashboard({
      dashboard: this.dashboard,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: this.dashboard.fields
    });
  }

  fieldChange() {}

  cancel() {
    this.ref.close();
  }
}
