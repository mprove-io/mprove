import { TreeDraggedElement } from 'angular-tree-component';
import * as configs from 'app/configs/_index';
import * as guards from 'app/guards/_index';
import * as resolvers from 'app/resolvers/_index';
import * as services from 'app/services/_index';

export const APP_PROVIDERS = [
  TreeDraggedElement,
  services.MyHttpService,
  services.MyWebSocketService,
  services.AuthService,
  services.TimeService,
  services.CookieService,
  services.DataSizeService,
  services.PageTitleService,
  services.DoCheckService,

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
  resolvers.LogoutResolver,

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
];
