import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { NavState } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface DashboardAddReportDialogData {
  apiService: ApiService;
  dashboard: common.Dashboard;
}

@Component({
  selector: 'm-dashboard-add-report-dialog',
  templateUrl: './dashboard-add-report-dialog.component.html'
})
export class DashboardAddReportDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  spinnerName = 'dashboardAddReport';

  models: common.Model[];

  constructor(
    public ref: DialogRef<DashboardAddReportDialogData>,
    private navQuery: NavQuery,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  async ngOnInit() {
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
      envId: nav.envId
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
            this.models = resp.payload.models.filter(z => z.hasAccess === true);

            this.spinner.hide(this.spinnerName);

            this.cd.detectChanges();
          }
        })
      )
      .toPromise();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  navToModel(modelId: string) {
    this.ref.close();

    this.navigateService.navigateToModel(modelId);
  }
}
