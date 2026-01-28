import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { PROJECT_ENVIRONMENTS_PAGE_TITLE } from '#common/constants/page-titles';
import {
  PATH_ENV_VARIABLES,
  PATH_ORG,
  PATH_PROJECT,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { Env } from '#common/interfaces/backend/env';
import { EnvUser } from '#common/interfaces/backend/env-user';
import { Ev } from '#common/interfaces/backend/ev';
import {
  ToBackendDeleteEnvUserRequestPayload,
  ToBackendDeleteEnvUserResponse
} from '#common/interfaces/to-backend/envs/to-backend-delete-env-user';
import {
  ToBackendEditEnvFallbacksRequestPayload,
  ToBackendEditEnvFallbacksResponse
} from '#common/interfaces/to-backend/envs/to-backend-edit-env-fallbacks';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-project-environments',
  templateUrl: './project-environments.component.html'
})
export class ProjectEnvironmentsComponent implements OnInit {
  pageTitle = PROJECT_ENVIRONMENTS_PAGE_TITLE;

  envProd = PROJECT_ENV_PROD;

  isShowValues: boolean;

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

  environments: Env[] = [];
  environments$ = this.environmentsQuery.environments$.pipe(
    tap(x => {
      this.environments = x.sort((a, b) =>
        b.envId === PROJECT_ENV_PROD && a.envId !== PROJECT_ENV_PROD
          ? 1
          : a.envId === PROJECT_ENV_PROD && b.envId !== PROJECT_ENV_PROD
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
    private userQuery: UserQuery,
    private memberQuery: MemberQuery,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  toggleShowValues() {
    this.isShowValues = !this.isShowValues;
  }

  addEnvironment() {
    this.myDialogService.showAddEnvironment({
      apiService: this.apiService,
      projectId: this.nav.projectId
    });
  }

  navToVariables(environment: Env) {
    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_ENV_VARIABLES,
      environment.envId
    ]);
  }

  addUser(env: Env) {
    this.myDialogService.showAddEnvUser({
      apiService: this.apiService,
      env: env
    });
  }

  removeUser(env: Env, envUser: EnvUser) {
    let payload: ToBackendDeleteEnvUserRequestPayload = {
      projectId: env.projectId,
      envId: env.envId,
      envUserId: envUser.userId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteEnvUser,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteEnvUserResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.environmentsQuery.update({ environments: resp.payload.envs });

            let nav = this.navQuery.getValue();
            let user = this.userQuery.getValue();

            if (nav.envId === env.envId && user.userId === envUser.userId) {
              this.navQuery.updatePart({
                envId: PROJECT_ENV_PROD,
                needValidate: false
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  isFallbackConnectionsChange(env: Env) {
    let payload: ToBackendEditEnvFallbacksRequestPayload = {
      projectId: env.projectId,
      envId: env.envId,
      isFallbackToProdConnections: !env.isFallbackToProdConnections,
      isFallbackToProdVariables: env.isFallbackToProdVariables
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditEnvFallbacks,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditEnvFallbacksResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.environmentsQuery.update({ environments: resp.payload.envs });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  isFallbackEnvVarsChange(env: Env) {
    let payload: ToBackendEditEnvFallbacksRequestPayload = {
      projectId: env.projectId,
      envId: env.envId,
      isFallbackToProdConnections: env.isFallbackToProdConnections,
      isFallbackToProdVariables: !env.isFallbackToProdVariables
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditEnvFallbacks,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditEnvFallbacksResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.environmentsQuery.update({ environments: resp.payload.envs });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  addVar(env: Env) {
    this.myDialogService.showAddEv({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      envId: env.envId
    });
  }

  editVar(env: Env, ev: Ev) {
    this.myDialogService.showEditEv({
      apiService: this.apiService,
      env: env,
      ev: ev
    });
  }

  removeVar(env: Env, ev: Ev) {
    this.myDialogService.showDeleteEv({
      apiService: this.apiService,
      env: env,
      ev: ev
    });
  }

  deleteEnvironment(environment: Env) {
    this.myDialogService.showDeleteEnvironment({
      apiService: this.apiService,
      projectId: environment.projectId,
      envId: environment.envId
    });
  }
}
