import { Routes } from '@angular/router';
import {
  PARAMETER_BRANCH_ID,
  PARAMETER_CHART_ID,
  PARAMETER_DASHBOARD_ID,
  PARAMETER_ENV_ID,
  PARAMETER_FILE_ID,
  PARAMETER_MODEL_ID,
  PARAMETER_ORG_ID,
  PARAMETER_PROJECT_ID,
  PARAMETER_REPORT_ID,
  PARAMETER_REPO_ID,
  PATH_ACCOUNT,
  PATH_BRANCH,
  PATH_CHART,
  PATH_CHARTS_LIST,
  PATH_COMPLETE_REGISTRATION,
  PATH_CONFIRM_EMAIL,
  PATH_CONNECTIONS,
  PATH_DASHBOARD,
  PATH_DASHBOARDS,
  PATH_DASHBOARDS_LIST,
  PATH_EMAIL_CONFIRMED,
  PATH_ENV,
  PATH_ENVIRONMENTS,
  PATH_FILE,
  PATH_FILES,
  PATH_FORGOT_PASSWORD,
  PATH_INFO,
  PATH_LOGIN,
  PATH_LOGIN_SUCCESS,
  PATH_MODEL,
  PATH_MODELS,
  PATH_MODELS_LIST,
  PATH_NEW_PASSWORD_WAS_SET,
  PATH_ORG,
  PATH_ORG_DELETED,
  PATH_ORG_OWNER_CHANGED,
  PATH_PASSWORD_RESET_SENT,
  PATH_PASSWORD_RESET_SENT_AUTH,
  PATH_PROFILE,
  PATH_PROJECT,
  PATH_PROJECT_DELETED,
  PATH_REGISTER,
  PATH_REPO,
  PATH_REPORT,
  PATH_REPORTS,
  PATH_REPORTS_LIST,
  PATH_TEAM,
  PATH_UPDATE_PASSWORD,
  PATH_USERS,
  PATH_USER_DELETED,
  PATH_VERIFY_EMAIL
} from '~common/constants/top';
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
import { DashboardComponent } from './modules/dashboards/dashboard/dashboard.component';
import { DashboardsListComponent } from './modules/dashboards/dashboards-list/dashboards-list.component';
import { DashboardsComponent } from './modules/dashboards/dashboards.component';
import { FileEditorComponent } from './modules/files/file-editor/file-editor.component';
import { FilesComponent } from './modules/files/files.component';
import { ChartComponent } from './modules/models/chart/chart.component';
import { ChartsListComponent } from './modules/models/charts-list/charts-list.component';
import { ModelComponent } from './modules/models/model/model.component';
import { ModelsListComponent } from './modules/models/models-list/models-list.component';
import { ModelsComponent } from './modules/models/models.component';
import { NavComponent } from './modules/nav/nav.component';
import { NavbarComponent } from './modules/navbar/navbar.component';
import { OrgAccountComponent } from './modules/org/org-account/org-account.component';
import { OrgUsersComponent } from './modules/org/org-users/org-users.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { ProjectConnectionsComponent } from './modules/project/project-connections/project-connections.component';
import { ProjectEnvironmentsComponent } from './modules/project/project-environments/project-environments.component';
import { ProjectInfoComponent } from './modules/project/project-info/project-info.component';
import { ProjectTeamComponent } from './modules/project/project-team/project-team.component';
import { ReportComponent } from './modules/reports/report/report.component';
import { ReportsListComponent } from './modules/reports/reports-list/reports-list.component';
import { ReportsComponent } from './modules/reports/reports.component';
import { LoginSuccessComponent } from './modules/special/login-success/login-success.component';
import { NotFoundComponent } from './modules/special/not-found/not-found.component';
import { OrgDeletedComponent } from './modules/special/org-deleted/org-deleted.component';
import { OrgOwnerChangedComponent } from './modules/special/org-owner-changed/org-owner-changed.component';
import { ProjectDeletedComponent } from './modules/special/project-deleted/project-deleted.component';
import { OrgAccountResolver } from './resolvers/org-account.resolver';
import { OrgUsersResolver } from './resolvers/org-users.resolver';
import { OrgResolver } from './resolvers/org.resolver';
import { FileResolver } from './resolvers/part/file.resolver';
import { NavBarResolver } from './resolvers/part/navbar.resolver';
import { ProfileResolver } from './resolvers/part/profile.resolver';
import { ProjectConnectionsResolver } from './resolvers/project-connections.resolver';
import { ProjectEnvironmentsResolver } from './resolvers/project-environments.resolver';
import { ProjectInfoResolver } from './resolvers/project-info.resolver';
import { ProjectTeamResolver } from './resolvers/project-team.resolver';
import { ProjectResolver } from './resolvers/project.resolver';
import { RepoIdResolver } from './resolvers/repo-id.resolver';
import { RepoStructFilesResolver } from './resolvers/repo-struct-files.resolver';
import { RepoStructResolver } from './resolvers/repo-struct.resolver';
import { StructChartResolver } from './resolvers/struct-chart.resolver';
import { StructChartsResolver } from './resolvers/struct-charts.resolver';
import { StructDashboardResolver } from './resolvers/struct-dashboard.resolver';
import { StructDashboardsResolver } from './resolvers/struct-dashboards.resolver';
import { StructModelResolver } from './resolvers/struct-model.resolver';
import { StructReportResolver } from './resolvers/struct-report.resolver';
import { StructReportsResolver } from './resolvers/struct-reports.resolver';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: PATH_LOGIN,
    pathMatch: 'full'
  },
  {
    component: NavComponent,
    path: '',
    children: [
      {
        component: RegisterComponent,
        path: PATH_REGISTER
      },
      {
        component: VerifyEmailComponent,
        path: PATH_VERIFY_EMAIL
      },
      {
        component: ConfirmEmailComponent,
        path: PATH_CONFIRM_EMAIL
      },
      {
        component: EmailConfirmedComponent,
        path: PATH_EMAIL_CONFIRMED
      },
      {
        component: CompleteRegistrationComponent,
        path: PATH_COMPLETE_REGISTRATION
      },
      {
        component: LoginComponent,
        path: PATH_LOGIN
      },
      {
        component: UserDeletedComponent,
        path: PATH_USER_DELETED
      },
      {
        component: ForgotPasswordComponent,
        path: PATH_FORGOT_PASSWORD
      },
      {
        component: PasswordResetSentComponent,
        path: PATH_PASSWORD_RESET_SENT
      },
      {
        component: UpdatePasswordComponent,
        path: PATH_UPDATE_PASSWORD
      },
      {
        component: NewPasswordWasSetComponent,
        path: PATH_NEW_PASSWORD_WAS_SET
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
        path: PATH_LOGIN_SUCCESS
      },
      {
        component: PasswordResetSentComponent,
        path: PATH_PASSWORD_RESET_SENT_AUTH
      },
      {
        component: ProfileComponent,
        path: PATH_PROFILE,
        resolve: [ProfileResolver]
      },
      {
        component: OrgDeletedComponent,
        path: PATH_ORG_DELETED
      },
      {
        component: OrgOwnerChangedComponent,
        path: PATH_ORG_OWNER_CHANGED
      },
      {
        component: ProjectDeletedComponent,
        path: PATH_PROJECT_DELETED
      },
      {
        path: PATH_ORG + `/:${PARAMETER_ORG_ID}`,
        resolve: [OrgResolver],
        children: [
          {
            component: OrgAccountComponent,
            path: PATH_ACCOUNT,
            resolve: [OrgAccountResolver]
          },
          {
            component: OrgUsersComponent,
            path: PATH_USERS,
            resolve: [OrgUsersResolver]
          },
          {
            path: PATH_PROJECT + `/:${PARAMETER_PROJECT_ID}`,
            resolve: [ProjectResolver],
            children: [
              {
                component: ProjectInfoComponent,
                path: PATH_INFO,
                resolve: [ProjectInfoResolver]
              },
              {
                component: ProjectConnectionsComponent,
                path: PATH_CONNECTIONS,
                resolve: [ProjectConnectionsResolver]
              },
              {
                component: ProjectEnvironmentsComponent,
                path: PATH_ENVIRONMENTS,
                resolve: [ProjectEnvironmentsResolver]
              },
              {
                component: ProjectTeamComponent,
                path: PATH_TEAM,
                resolve: [ProjectTeamResolver]
              },
              {
                path: PATH_REPO + `/:${PARAMETER_REPO_ID}`,
                resolve: [RepoIdResolver],
                children: [
                  {
                    path: PATH_BRANCH + `/:${PARAMETER_BRANCH_ID}`,
                    children: [
                      {
                        path: PATH_ENV + `/:${PARAMETER_ENV_ID}`,
                        resolve: [RepoStructResolver],
                        children: [
                          {
                            component: FilesComponent,
                            path: PATH_FILES,
                            resolve: [RepoStructFilesResolver],
                            children: [
                              {
                                component: FileEditorComponent,
                                canDeactivate: [DeactivateGuard],
                                path: PATH_FILE + `/:${PARAMETER_FILE_ID}`,
                                resolve: [FileResolver]
                              }
                            ]
                          },
                          {
                            component: ModelsComponent,
                            path: PATH_MODELS,
                            resolve: [StructChartsResolver],
                            children: [
                              {
                                component: ChartsListComponent,
                                path: PATH_CHARTS_LIST
                              },
                              {
                                component: ModelsListComponent,
                                path: PATH_MODELS_LIST
                              },
                              {
                                component: ModelComponent,
                                path: PATH_MODEL + `/:${PARAMETER_MODEL_ID}`,
                                resolve: [StructModelResolver],
                                children: [
                                  {
                                    component: ChartComponent,
                                    path:
                                      PATH_CHART + `/:${PARAMETER_CHART_ID}`,
                                    resolve: [StructChartResolver]
                                  },
                                  {
                                    component: ChartsListComponent,
                                    path: PATH_CHARTS_LIST
                                  },
                                  {
                                    component: ModelsListComponent,
                                    path: PATH_MODELS_LIST
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            component: DashboardsComponent,
                            path: PATH_DASHBOARDS,
                            resolve: [StructDashboardsResolver],
                            children: [
                              {
                                component: DashboardComponent,
                                path:
                                  PATH_DASHBOARD +
                                  `/:${PARAMETER_DASHBOARD_ID}`,
                                resolve: [StructDashboardResolver]
                              },
                              {
                                component: DashboardsListComponent,
                                path: PATH_DASHBOARDS_LIST
                              }
                            ]
                          },
                          {
                            component: ReportsComponent,
                            path: PATH_REPORTS,
                            resolve: [StructReportsResolver],
                            children: [
                              {
                                component: ReportComponent,
                                path: PATH_REPORT + `/:${PARAMETER_REPORT_ID}`,
                                resolve: [StructReportResolver]
                              },
                              {
                                component: ReportsListComponent,
                                path: PATH_REPORTS_LIST
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
      }
    ]
  },
  {
    component: NotFoundComponent,
    path: '**'
  }
];
