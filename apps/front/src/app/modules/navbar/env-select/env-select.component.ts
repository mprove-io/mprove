import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { UserState } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-env-select',
  templateUrl: './env-select.component.html'
})
export class EnvSelectComponent {
  envsList: common.EnvsItem[] = [];
  envsListLoading = false;
  envsListLength = 0;

  selectedProjectId: string;
  selectedEnvId: string;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;

      this.envsList = [x];
      this.selectedProjectId = x.projectId;
      this.selectedEnvId = x.envId;

      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  user: UserState;
  user$ = this.userQuery.select().pipe(
    tap(x => {
      this.user = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private navStore: NavStore
  ) {}

  openEnvSelect() {
    this.envsListLoading = true;

    let payload: apiToBackend.ToBackendGetEnvsListRequestPayload = {
      projectId: this.selectedProjectId
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvsList,
        payload
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetEnvsListResponse) =>
            resp.payload.envsList
        ),
        tap(x => {
          this.envsList = x;
          this.envsListLoading = false;
          this.envsListLength = x.length;
        }),
        take(1)
      )
      .subscribe();
  }

  envChange() {
    // this.router.navigate([
    //   common.PATH_ORG,
    //   this.selectedOrgId,
    //   common.PATH_PROJECT,
    //   this.selectedProjectId,
    //   common.PATH_SETTINGS
    // ]);

    this.navStore.update(state =>
      Object.assign({}, state, <NavState>{
        envId: this.selectedEnvId
      })
    );
  }
}
