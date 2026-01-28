import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { EMPTY_CHART_ID } from '#common/constants/top';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { Dashboard } from '#common/interfaces/blockml/dashboard';
import { Model } from '#common/interfaces/blockml/model';
import {
  ToBackendGetModelsRequestPayload,
  ToBackendGetModelsResponse
} from '#common/interfaces/to-backend/models/to-backend-get-models';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';

export interface DashboardAddTileDialogData {
  apiService: ApiService;
  dashboard: Dashboard;
}

@Component({
  selector: 'm-dashboard-add-tile-dialog',
  templateUrl: './dashboard-add-tile-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, NgxSpinnerModule]
})
export class DashboardAddTileDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  spinnerName = 'dashboardAddTile';

  models: Model[];

  constructor(
    public ref: DialogRef<DashboardAddTileDialogData>,
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

    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendGetModelsRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId
    };

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetModels,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.models = resp.payload.models.filter(y => y.hasAccess === true);

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

    this.navigateService.navigateToChart({
      modelId: modelId,
      chartId: EMPTY_CHART_ID
    });
  }
}
