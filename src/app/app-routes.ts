import { Routes } from '@angular/router';
import * as guards from 'app/guards/_index';
import * as resolvers from 'app/resolvers/_index';
import * as components from 'app/components/_index';

export const APP_ROUTES: Routes = [
  {
    path: 'soft',
    component: components.SoftComponent
  },
  {
    path: '',
    component: components.SpaceComponent,
    resolve: {
      stateResolver: resolvers.StateResolver
    },
    children: [
      {
        path: 'login',
        component: components.LoginComponent
      },
      {
        path: 'logout',
        component: components.LogoutComponent,
        resolve: {
          logoutResolver: resolvers.LogoutResolver
        }
      },
      {
        path: '',
        redirectTo: '/profile',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        component: components.ProfileComponent,
        canActivate: [guards.AuthCanActivateGuard]
      },
      {
        path: 'project/:projectId',
        component: components.ProjectComponent,
        canActivate: [guards.AuthCanActivateGuard],
        resolve: {
          projectSelectedResolver: resolvers.ProjectResolver
        },
        children: [
          {
            path: 'team',
            component: components.TeamComponent,
            resolve: {
              teamResolver: resolvers.TeamResolver
            }
          },
          {
            path: 'settings',
            component: components.SettingsComponent,
            resolve: {
              settingsResolver: resolvers.SettingsResolver
            }
          },
          {
            path: 'remote',
            component: components.RemoteComponent
          },
          {
            path: 'billing',
            component: components.BillingComponent,
            resolve: {
              teamResolver: resolvers.BillingResolver
            }
          },
          {
            path: 'mode/:mode',
            component: components.RepoComponent,
            resolve: {
              modeResolver: resolvers.ModeResolver
            },
            children: [
              {
                path: 'pdts',
                component: components.PdtsComponent,
                canDeactivate: [guards.ComponentDeactivateGuard],
                resolve: {
                  fileSelectedResolver: resolvers.PDTResolver
                }
              },
              {
                path: 'blockml',
                component: components.BlockMLComponent,
                children: [
                  {
                    path: 'file/:fileId',
                    component: components.FileEditorComponent,
                    canDeactivate: [guards.ComponentDeactivateGuard],
                    resolve: {
                      fileSelectedResolver: resolvers.FileResolver
                    }
                  }
                ]
              },
              {
                path: 'model/:modelId',
                component: components.ModelComponent,
                canDeactivate: [guards.ComponentDeactivateGuard],
                resolve: {
                  modelSelectedResolver: resolvers.ModelResolver
                },
                children: [
                  {
                    path: 'mconfig/:mconfigId',
                    component: components.MconfigComponent,
                    canDeactivate: [guards.ComponentDeactivateGuard],
                    resolve: {
                      mconfigSelectedResolver: resolvers.MconfigResolver
                    },
                    children: [
                      {
                        path: 'query/:queryId',
                        component: components.QueryComponent,
                        canDeactivate: [guards.ComponentDeactivateGuard],
                        resolve: {
                          querySelectedResolver: resolvers.QueryResolver
                        },
                        children: [
                          {
                            path: 'filters',
                            component: components.ModelFiltersComponent
                          },
                          {
                            path: 'sql',
                            component: components.SqlComponent
                          },
                          {
                            path: 'data',
                            component: components.DataComponent
                          },
                          {
                            path: 'chart/:chartId',
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
                path: 'dashboard/:dashboardId',
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
        path: 'project-deleted',
        component: components.ProjectDeletedComponent,
        canActivate: [guards.AuthCanActivateGuard]
      },
      {
        path: '**',
        component: components.NotFound404Component
      }
    ]
  }
];
