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
import type { ToBackendGetModelsRequest } from '#common/types/backend/routes/models/get-models/get-models-request';
import type { ToBackendGetModelsResponse } from '#common/types/backend/routes/models/get-models/get-models-response';
import type { Dashboard } from '#common/types/blockml/parts/dashboard';
import type { Model } from '#common/types/blockml/parts/model';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';

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

    let payload: ToBackendGetModelsRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId
    };

    apiService
      .req({
        route: 'api/ToBackendGetModels',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelsResponse) => {
          if (resp?.type === 'Success') {
            this.models = resp.output.models.filter(y => y.hasAccess === true);

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
