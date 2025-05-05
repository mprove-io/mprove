import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { filter, map, take, tap } from 'rxjs/operators';
import { checkNavCharts } from '~front/app/functions/check-nav-charts';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery, UserState } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-env-select',
  templateUrl: './env-select.component.html'
})
export class EnvSelectComponent {
  @ViewChild('envSelect', { static: false })
  envSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.envSelectElement?.close();
  }

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

  showEmptySelector = false;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.showEmptySelector = false;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  openEnvSelect() {
    this.envsListLoading = true;

    let payload: apiToBackend.ToBackendGetEnvsListRequestPayload = {
      projectId: this.selectedProjectId,
      isFilter: true
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvsList,
        payload: payload
      })
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
    this.showEmptySelector = true;
    this.cd.detectChanges();

    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    let repoId = this.nav.isRepoProd === true ? common.PROD_REPO_ID : userId;

    let urlParts = this.router.url.split('/');

    let navArray = checkNavCharts({
      urlParts: urlParts,
      navArray: [
        common.PATH_ORG,
        this.nav.orgId,
        common.PATH_PROJECT,
        this.nav.projectId,
        common.PATH_REPO,
        repoId,
        common.PATH_BRANCH,
        this.nav.branchId,
        common.PATH_ENV,
        this.selectedEnvId
      ]
    });

    if (urlParts[11] === common.PATH_REPORTS) {
      let uiState = this.uiQuery.getValue();
      uiState.gridApi?.deselectAll();
    }

    this.router.navigate(navArray);
  }
}
