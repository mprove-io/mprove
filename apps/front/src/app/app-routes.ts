import { Routes } from '@angular/router';
import { common } from '~front/barrels/common';
import { DeactivateGuard } from './guards/deactivate.guard';
import { RegisterComponent } from './modules/auth/main/01-register/register.component';
import { VerifyEmailComponent } from './modules/auth/main/02-verify-email/verify-email.component';
import { ConfirmEmailComponent } from './modules/auth/main/03-confirm-email/confirm-email.component';
import { EmailConfirmedComponent } from './modules/auth/main/04-email-confirmed/email-confirmed.component';
import { LoginComponent } from './modules/auth/main/05-login/login.component';
import { UserDeletedComponent } from './modules/auth/main/06-user-deleted/user-deleted.component';
import { CompleteRegistrationComponent } from './modules/auth/main/07-complete-registration/complete-registration.component';
import { ForgotPasswordComponent } from './modules/auth/password/01-forgot-password/forgot-password.component';
import { PasswordResetSentComponent } from './modules/auth/password/02-password-reset-sent/password-reset-sent.component';
import { UpdatePasswordComponent } from './modules/auth/password/03-update-password/update-password.component';
import { NewPasswordWasSetComponent } from './modules/auth/password/04-new-password-was-set/new-password-was-set.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { DashboardsComponent } from './modules/dashboards/dashboards.component';
import { FileEditorComponent } from './modules/files/file-editor/file-editor.component';
import { FilesComponent } from './modules/files/files.component';
import { MetricsComponent } from './modules/metrics/metrics.component';
import { RepComponent } from './modules/metrics/rep/rep.component';
import { MconfigComponent } from './modules/model/mconfig/mconfig.component';
import { ModelComponent } from './modules/model/model.component';
import { QueryComponent } from './modules/model/query/query.component';
import { ModelsComponent } from './modules/models/models.component';
import { NavComponent } from './modules/nav/nav.component';
import { NavbarComponent } from './modules/navbar/navbar.component';
import { OrgAccountComponent } from './modules/org/org-account/org-account.component';
import { OrgUsersComponent } from './modules/org/org-users/org-users.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { ProjectConnectionsComponent } from './modules/project/project-connections/project-connections.component';
import { ProjectEnvironmentsComponent } from './modules/project/project-environments/project-environments.component';
import { ProjectEvsComponent } from './modules/project/project-evs/project-evs.component';
import { ProjectSettingsComponent } from './modules/project/project-settings/project-settings.component';
import { ProjectTeamComponent } from './modules/project/project-team/project-team.component';
import { LoginSuccessComponent } from './modules/special/login-success/login-success.component';
import { NotFoundComponent } from './modules/special/not-found/not-found.component';
import { OrgDeletedComponent } from './modules/special/org-deleted/org-deleted.component';
import { OrgOwnerChangedComponent } from './modules/special/org-owner-changed/org-owner-changed.component';
import { ProjectDeletedComponent } from './modules/special/project-deleted/project-deleted.component';
import { VisualizationsComponent } from './modules/visualizations/visualizations.component';
import { OrgAccountResolver } from './resolvers/org-account.resolver';
import { OrgUsersResolver } from './resolvers/org-users.resolver';
import { OrgResolver } from './resolvers/org.resolver';
import { FileResolver } from './resolvers/part/file.resolver';
import { MconfigResolver } from './resolvers/part/mconfig.resolver';
import { NavBarResolver } from './resolvers/part/navbar.resolver';
import { ProfileResolver } from './resolvers/part/profile.resolver';
import { QueryResolver } from './resolvers/part/query.resolver';
import { ProjectConnectionsResolver } from './resolvers/project-connections.resolver';
import { ProjectEnvEvsResolver } from './resolvers/project-env-evs.resolver';
import { ProjectEnvironmentsResolver } from './resolvers/project-environments.resolver';
import { ProjectSettingsResolver } from './resolvers/project-settings.resolver';
import { ProjectTeamResolver } from './resolvers/project-team.resolver';
import { ProjectResolver } from './resolvers/project.resolver';
import { RepoIdResolver } from './resolvers/repo-id.resolver';
import { RepoStructFilesResolver } from './resolvers/repo-struct-files.resolver';
import { RepoStructResolver } from './resolvers/repo-struct.resolver';
import { StructDashboardResolver } from './resolvers/struct-dashboard.resolver';
import { StructDashboardsResolver } from './resolvers/struct-dashboards.resolver';
import { StructMetricsResolver } from './resolvers/struct-metrics.resolver';
import { StructModelResolver } from './resolvers/struct-model.resolver';
import { StructModelsResolver } from './resolvers/struct-models.resolver';
import { StructRepResolver } from './resolvers/struct-rep.resolver';
import { StructVizsResolver } from './resolvers/struct-vizs.resolver';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: common.PATH_LOGIN,
    pathMatch: 'full'
  },
  {
    component: NavComponent,
    path: '',
    children: [
      {
        component: RegisterComponent,
        path: common.PATH_REGISTER
      },
      {
        component: VerifyEmailComponent,
        path: common.PATH_VERIFY_EMAIL
      },
      {
        component: ConfirmEmailComponent,
        path: common.PATH_CONFIRM_EMAIL
      },
      {
        component: EmailConfirmedComponent,
        path: common.PATH_EMAIL_CONFIRMED
      },
      {
        component: CompleteRegistrationComponent,
        path: common.PATH_COMPLETE_REGISTRATION
      },
      {
        component: LoginComponent,
        path: common.PATH_LOGIN
      },
      {
        component: UserDeletedComponent,
        path: common.PATH_USER_DELETED
      },
      {
        component: ForgotPasswordComponent,
        path: common.PATH_FORGOT_PASSWORD
      },
      {
        component: PasswordResetSentComponent,
        path: common.PATH_PASSWORD_RESET_SENT
      },
      {
        component: UpdatePasswordComponent,
        path: common.PATH_UPDATE_PASSWORD
      },
      {
        component: NewPasswordWasSetComponent,
        path: common.PATH_NEW_PASSWORD_WAS_SET
      }
    ]
  },
  {
    component: NavbarComponent,
    path: '',
    resolve: [NavBarResolver],
    children: [
      {
        component: LoginSuccessComponent,
        path: common.PATH_LOGIN_SUCCESS
      },
      {
        component: PasswordResetSentComponent,
        path: common.PATH_PASSWORD_RESET_SENT_AUTH
      },
      {
        component: ProfileComponent,
        path: common.PATH_PROFILE,
        resolve: [ProfileResolver]
      },
      {
        component: OrgDeletedComponent,
        path: common.PATH_ORG_DELETED
      },
      {
        component: OrgOwnerChangedComponent,
        path: common.PATH_ORG_OWNER_CHANGED
      },
      {
        component: ProjectDeletedComponent,
        path: common.PATH_PROJECT_DELETED
      },
      {
        path: common.PATH_ORG + `/:${common.PARAMETER_ORG_ID}`,
        resolve: [OrgResolver],
        children: [
          {
            component: OrgAccountComponent,
            path: common.PATH_ACCOUNT,
            resolve: [OrgAccountResolver]
          },
          {
            component: OrgUsersComponent,
            path: common.PATH_USERS,
            resolve: [OrgUsersResolver]
          },
          {
            path: common.PATH_PROJECT + `/:${common.PARAMETER_PROJECT_ID}`,
            resolve: [ProjectResolver],
            children: [
              {
                component: ProjectSettingsComponent,
                path: common.PATH_SETTINGS,
                resolve: [ProjectSettingsResolver]
              },
              {
                component: ProjectConnectionsComponent,
                path: common.PATH_CONNECTIONS,
                resolve: [ProjectConnectionsResolver]
              },
              {
                component: ProjectEnvironmentsComponent,
                path: common.PATH_ENVIRONMENTS,
                resolve: [ProjectEnvironmentsResolver]
              },
              {
                component: ProjectEvsComponent,
                path:
                  common.PATH_ENV_VARIABLES +
                  `/:${common.PARAMETER_ENVIRONMENT_ID}`,
                resolve: [ProjectEnvEvsResolver]
              },
              {
                component: ProjectTeamComponent,
                path: common.PATH_TEAM,
                resolve: [ProjectTeamResolver]
              },
              {
                path: common.PATH_REPO + `/:${common.PARAMETER_REPO_ID}`,
                resolve: [RepoIdResolver],
                children: [
                  {
                    path:
                      common.PATH_BRANCH + `/:${common.PARAMETER_BRANCH_ID}`,
                    children: [
                      {
                        path: common.PATH_ENV + `/:${common.PARAMETER_ENV_ID}`,
                        resolve: [RepoStructResolver],
                        children: [
                          {
                            component: FilesComponent,
                            path: common.PATH_FILES,
                            resolve: [RepoStructFilesResolver],
                            children: [
                              {
                                component: FileEditorComponent,
                                canDeactivate: [DeactivateGuard],
                                path:
                                  common.PATH_FILE +
                                  `/:${common.PARAMETER_FILE_ID}`,
                                resolve: [FileResolver]
                              }
                            ]
                          },
                          {
                            component: VisualizationsComponent,
                            path: common.PATH_VISUALIZATIONS,
                            resolve: [StructVizsResolver]
                          },
                          {
                            component: DashboardsComponent,
                            path: common.PATH_DASHBOARDS,
                            resolve: [StructDashboardsResolver]
                          },
                          {
                            component: ModelsComponent,
                            path: common.PATH_MODELS,
                            resolve: [StructModelsResolver]
                          },
                          {
                            component: ModelComponent,
                            canDeactivate: [DeactivateGuard],
                            path:
                              common.PATH_MODEL +
                              `/:${common.PARAMETER_MODEL_ID}`,
                            resolve: [StructModelResolver],
                            children: [
                              {
                                component: MconfigComponent,
                                path:
                                  common.PATH_MCONFIG +
                                  `/:${common.PARAMETER_MCONFIG_ID}`,
                                resolve: [MconfigResolver],
                                children: [
                                  {
                                    component: QueryComponent,
                                    path:
                                      common.PATH_QUERY +
                                      `/:${common.PARAMETER_QUERY_ID}`,
                                    resolve: [QueryResolver]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            component: MetricsComponent,
                            canDeactivate: [DeactivateGuard],
                            path: common.PATH_METRICS,
                            resolve: [StructMetricsResolver],
                            children: [
                              {
                                component: RepComponent,
                                path:
                                  common.PATH_REPORT +
                                  `/:${common.PARAMETER_REP_ID}`,
                                resolve: [StructRepResolver]
                              }
                            ]
                          },
                          {
                            component: DashboardComponent,
                            canDeactivate: [DeactivateGuard],
                            path:
                              common.PATH_DASHBOARD +
                              `/:${common.PARAMETER_DASHBOARD_ID}`,
                            resolve: [StructDashboardResolver],
                            children: []
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    component: NotFoundComponent,
    path: '**'
  }
];
