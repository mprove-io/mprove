import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs/operators';
import {
  DEMO_ORG_NAME,
  PATH_CONNECTIONS,
  PATH_ENVIRONMENTS,
  PATH_GIVENS,
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT,
  PATH_PROVIDERS,
  PATH_ROLES,
  PATH_SANDBOX_PROVIDER,
  PATH_TEAM,
  RESTRICTED_USER_ALIAS
} from '#common/constants/top';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendGetUserGivensRequestPayload,
  ToBackendGetUserGivensResponse
} from '#common/zod/to-backend/users/to-backend-get-user-givens';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-project-menu',
  templateUrl: './project-menu.component.html'
})
export class ProjectMenuComponent implements OnInit {
  restrictedUserAlias = RESTRICTED_USER_ALIAS;

  demoOrgName = DEMO_ORG_NAME;

  pathInfo = PATH_INFO;
  pathSandboxProvider = PATH_SANDBOX_PROVIDER;
  pathProviders = PATH_PROVIDERS;
  pathConnections = PATH_CONNECTIONS;
  pathEnvironments = PATH_ENVIRONMENTS;
  pathGivens = PATH_GIVENS;
  pathRoles = PATH_ROLES;
  pathTeam = PATH_TEAM;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[5];
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
      this.cd.detectChanges();
    })
  );

  isAdmin: boolean;
  isAdmin$ = this.memberQuery.isAdmin$.pipe(
    tap(x => {
      this.isAdmin = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[5];
  }

  navigateInfo() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_INFO
    ]);
  }

  navigateConnections() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_CONNECTIONS
    ]);
  }

  navigateProviders() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_PROVIDERS
    ]);
  }

  navigateEnvironments() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_ENVIRONMENTS
    ]);
  }

  navigateGivens() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_GIVENS
    ]);
  }

  navigateRoles() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_ROLES
    ]);
  }

  navigateTeam() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_TEAM
    ]);
  }

  navigateSandboxProvider() {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_SANDBOX_PROVIDER
    ]);
  }

  showSelectedGivens() {
    let payload: ToBackendGetUserGivensRequestPayload = {
      projectId: this.nav.projectId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetUserGivens,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendGetUserGivensResponse) => {
          if (resp.info?.status !== ResponseInfoStatusEnum.Ok) {
            return;
          }

          let user = resp.payload.user;

          this.userQuery.update(user);
          this.uiQuery.updatePart({ ...user.ui });

          this.myDialogService.showSelectedGivens({
            projectId: this.nav.projectId,
            userId: user.userId,
            memberGivens: resp.payload.memberGivens
          });
        }),
        take(1)
      )
      .subscribe();
  }
}
