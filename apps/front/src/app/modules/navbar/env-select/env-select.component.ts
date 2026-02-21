import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { filter, map, take, tap } from 'rxjs/operators';
import {
  PATH_BRANCH,
  PATH_ENV,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PATH_REPORTS,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { EnvsItem } from '#common/interfaces/backend/envs-item';
import {
  ToBackendGetEnvsListRequestPayload,
  ToBackendGetEnvsListResponse
} from '#common/interfaces/to-backend/envs/to-backend-get-envs-list';
import { checkNavMain } from '#front/app/functions/check-nav-main';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery, UserState } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';

@Component({
  standalone: false,
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

  projectEnvProd = PROJECT_ENV_PROD;

  envsList: EnvsItem[] = [];
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

    let payload: ToBackendGetEnvsListRequestPayload = {
      projectId: this.selectedProjectId,
      isFilter: true
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetEnvsList,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetEnvsListResponse) => resp.payload.envsList),
        tap(x => {
          this.envsList = x;
          this.envsListLoading = false;
          this.envsListLength = x.length;
          this.cd.detectChanges();
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

    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : userId;

    let urlParts = this.router.url.split('/');

    let projectDashboardLinks = this.uiQuery.getValue().projectDashboardLinks;
    let pLink = projectDashboardLinks.find(
      link => link.projectId === this.nav.projectId
    );

    let navArray = checkNavMain({
      urlParts: urlParts,
      navArray: [
        PATH_ORG,
        this.nav.orgId,
        PATH_PROJECT,
        this.nav.projectId,
        PATH_REPO,
        repoId,
        PATH_BRANCH,
        this.nav.branchId,
        PATH_ENV,
        this.selectedEnvId
      ],
      lastDashboardId: pLink?.dashboardId
    });

    if (urlParts[11] === PATH_REPORTS) {
      let uiState = this.uiQuery.getValue();
      uiState.gridApi?.deselectAll();
    }

    this.router.navigate(navArray);
  }
}
