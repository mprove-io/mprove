import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  standalone: false,
  selector: 'm-project-environments',
  templateUrl: './project-environments.component.html'
})
export class ProjectEnvironmentsComponent implements OnInit {
  pageTitle = constants.PROJECT_ENVIRONMENTS_PAGE_TITLE;

  envProd = common.PROJECT_ENV_PROD;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
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

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
      this.cd.detectChanges();
    })
  );

  environments: common.Env[] = [];
  environments$ = this.environmentsQuery.environments$.pipe(
    tap(x => {
      this.environments = x.sort((a, b) =>
        b.envId === common.PROJECT_ENV_PROD &&
        a.envId !== common.PROJECT_ENV_PROD
          ? 1
          : a.envId === common.PROJECT_ENV_PROD &&
              b.envId !== common.PROJECT_ENV_PROD
            ? -1
            : a.envId > b.envId
              ? 1
              : b.envId > a.envId
                ? -1
                : 0
      );

      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private environmentsQuery: EnvironmentsQuery,
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private router: Router,
    private navQuery: NavQuery,
    private memberQuery: MemberQuery,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  addEnvironment() {
    this.myDialogService.showAddEnvironment({
      apiService: this.apiService,
      projectId: this.nav.projectId
    });
  }

  navToVariables(environment: common.Env) {
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_ENV_VARIABLES,
      environment.envId
    ]);
  }

  addUser(env: common.Env) {
    this.myDialogService.showAddEnvUser({
      apiService: this.apiService,
      env: env
    });
  }

  removeUser(env: common.Env, envUser: common.EnvUser) {
    let payload: apiToBackend.ToBackendDeleteEnvUserRequestPayload = {
      projectId: env.projectId,
      envId: env.envId,
      envUserId: envUser.userId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteEnvUser,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteEnvUserResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let environmentsState = this.environmentsQuery.getValue();

            let stateEnv = environmentsState.environments.find(
              x => x.envId === env.envId
            );

            stateEnv.envUsers = stateEnv.envUsers.filter(
              x => x.userId !== envUser.userId
            );

            this.environmentsQuery.update({
              environments: [...environmentsState.environments]
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  isFallbackConnectionsChange(env: common.Env) {}

  isFallbackEnvVarsChange(env: common.Env) {}

  addVar(env: common.Env) {
    this.myDialogService.showAddEv({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      envId: env.envId
    });
  }

  editVar(env: common.Env, ev: common.Ev) {
    this.myDialogService.showEditEv({
      apiService: this.apiService,
      env: env,
      ev: ev
    });
  }

  removeVar(env: common.Env, ev: common.Ev) {
    this.myDialogService.showDeleteEv({
      apiService: this.apiService,
      env: env,
      ev: ev
    });
  }

  deleteEnvironment(environment: common.Env) {
    this.myDialogService.showDeleteEnvironment({
      apiService: this.apiService,
      projectId: environment.projectId,
      envId: environment.envId
      // pageNum: this.currentPage,
      // getEnvsPageFn: this.getEnvsPage.bind(this)
    });
  }
}
