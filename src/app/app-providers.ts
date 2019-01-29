import { TreeDraggedElement } from 'angular-tree-component';
import * as configs from '@app/configs/_index';
import * as guards from '@app/guards/_index';
import * as resolvers from '@app/resolvers/_index';
import * as services from '@app/services/_index';
import { ErrorHandler } from '@angular/core';
import { RouterStateSerializer } from '@ngrx/router-store';
import * as helper from '@app/helper/_index';
import { Title } from '@angular/platform-browser';
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher
} from '@angular/material';

export const APP_PROVIDERS = [
  {
    provide: RouterStateSerializer,
    useClass: helper.NgrxCustomRouterStateSerializer
  },
  Title,
  {
    provide: ErrorStateMatcher,
    useClass: ShowOnDirtyErrorStateMatcher
  },
  TreeDraggedElement,
  services.MyHttpService,
  services.MyWebSocketService,
  services.AuthService,
  services.TimeService,
  services.CookieService,
  services.DataSizeService,
  services.PageTitleService,
  services.WatchAuthenticationService,
  services.WatchWebsocketService,

  guards.AuthCanActivateGuard,
  guards.ComponentDeactivateGuard,

  resolvers.StateResolver,
  resolvers.ProjectResolver,
  resolvers.ModeResolver,
  resolvers.FileResolver,
  resolvers.ModelResolver,
  resolvers.MconfigResolver,
  resolvers.QueryResolver,
  resolvers.ChartResolver,
  resolvers.DashboardResolver,
  resolvers.PDTResolver,
  resolvers.TeamResolver,
  resolvers.SettingsResolver,
  resolvers.BillingResolver,
  resolvers.ToProfileResolver,

  services.DataService,
  services.LiveQueriesService,
  services.DialogService,
  services.NavigateService,
  services.MyDialogService,
  services.StructService,
  services.ValidationService,

  services.BackendService,
  {
    provide: services.PrinterService,
    useClass: services.ConsoleLogService
  },
  configs.APP_CONFIG_PROVIDER,
  {
    provide: ErrorHandler,
    useClass: services.MyErrorHandler
  }
];
