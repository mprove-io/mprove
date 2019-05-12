import { Routes } from '@angular/router';
import * as guards from '@app/guards/_index';
import * as resolvers from '@app/resolvers/_index';
import * as components from '@app/components/_index';
import * as constants from '@app/constants/_index';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: components.SpaceComponent,
    children: [
      {
        path: '',
        redirectTo: '/' + constants.PATH_PROFILE,
        pathMatch: 'full'
      },
      {
        path: constants.PATH_LOGIN,
        component: components.LoginComponent,
        resolve: {
          toProfileResolver: resolvers.ToProfileResolver
        }
      },
      {
        path: constants.PATH_REGISTER,
        component: components.RegisterComponent,
        resolve: {
          toProfileResolver: resolvers.ToProfileResolver
        }
      },
      {
        path: constants.PATH_VERIFY_EMAIL_SENT,
        component: components.VerifyEmailSentComponent,
        resolve: {
          toProfileResolver: resolvers.ToProfileResolver
        }
      },
      {
        path: constants.PATH_CONFIRM_EMAIL,
        component: components.ConfirmEmailComponent
      },
      {
        path: constants.PATH_RESET_PASSWORD_SENT,
        component: components.ResetPasswordSentComponent
      },
      {
        path: constants.PATH_UPDATE_PASSWORD,
        component: components.UpdatePasswordComponent
      }
    ]
  },
  {
    path: '',
    component: components.SpaceComponent,
    resolve: {
      stateResolver: resolvers.StateResolver
    },
    children: [
      {
        path: constants.PATH_PROFILE,
        component: components.ProfileComponent,
        canActivate: [guards.AuthCanActivateGuard]
      },
      {
        path: constants.PATH_PROJECT + '/:projectId',
        component: components.ProjectComponent,
        canActivate: [guards.AuthCanActivateGuard],
        resolve: {
          projectSelectedResolver: resolvers.ProjectResolver
        },
        children: [
          {
            path: constants.PATH_TEAM,
            component: components.TeamComponent,
            resolve: {
              teamResolver: resolvers.TeamResolver
            }
          },
          {
            path: constants.PATH_SETTINGS,
            component: components.SettingsComponent,
            resolve: {
              settingsResolver: resolvers.SettingsResolver
            }
          },
          // {
          //   path: constants.PATH_REMOTE,
          //   component: components.RemoteComponent
          // },
          {
            path: constants.PATH_MODE + '/:mode',
            component: components.RepoComponent,
            resolve: {
              modeResolver: resolvers.ModeResolver
            },
            children: [
              {
                path: constants.PATH_PDTS,
                component: components.PdtsComponent,
                canDeactivate: [guards.ComponentDeactivateGuard],
                resolve: {
                  pdtResolver: resolvers.PDTResolver
                }
              },
              {
                path: constants.PATH_VIEWS_GRAPH,
                component: components.ViewsGraphComponent,
                canDeactivate: [guards.ComponentDeactivateGuard]
              },
              {
                path: constants.PATH_BLOCKML,
                component: components.BlockMLComponent,
                children: [
                  {
                    path: constants.PATH_FILE + '/:fileId',
                    component: components.FileEditorComponent,
                    canDeactivate: [guards.ComponentDeactivateGuard],
                    resolve: {
                      fileSelectedResolver: resolvers.FileResolver
                    }
                  }
                ]
              },
              {
                path: constants.PATH_MODEL + '/:modelId',
                component: components.ModelComponent,
                canDeactivate: [guards.ComponentDeactivateGuard],
                resolve: {
                  modelSelectedResolver: resolvers.ModelResolver
                },
                children: [
                  {
                    path: constants.PATH_MCONFIG + '/:mconfigId',
                    component: components.MconfigComponent,
                    canDeactivate: [guards.ComponentDeactivateGuard],
                    resolve: {
                      mconfigSelectedResolver: resolvers.MconfigResolver
                    },
                    children: [
                      {
                        path: constants.PATH_QUERY + '/:queryId',
                        component: components.QueryComponent,
                        canDeactivate: [guards.ComponentDeactivateGuard],
                        resolve: {
                          querySelectedResolver: resolvers.QueryResolver
                        },
                        children: [
                          {
                            path: constants.PATH_FILTERS,
                            component: components.ModelFiltersComponent
                          },
                          {
                            path: constants.PATH_SQL,
                            component: components.SqlComponent
                          },
                          {
                            path: constants.PATH_DATA,
                            component: components.DataComponent
                          },
                          {
                            path: constants.PATH_CHART + '/:chartId',
                            component: components.ChartComponent,
                            canDeactivate: [guards.ComponentDeactivateGuard],
                            resolve: {
                              chartSelectedResolver: resolvers.ChartResolver
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                path: constants.PATH_DASHBOARD + '/:dashboardId',
                component: components.DashboardComponent,
                canDeactivate: [guards.ComponentDeactivateGuard],
                resolve: {
                  modelSelectedResolver: resolvers.DashboardResolver
                }
              }
            ]
          }
        ]
      },
      {
        path: '**',
        component: components.NotFound404Component
      }
    ]
  }
];
