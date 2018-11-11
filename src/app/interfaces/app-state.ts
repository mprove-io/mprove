import * as fromRouter from '@ngrx/router-store';
import * as api from 'src/app/api/_index';
import { NgrxRouterStateUrl } from 'src/app/interfaces/ngrx-router-state-url';
import { LayoutState } from 'src/app/interfaces/state/layout-state';
import { UserState } from 'src/app/interfaces/state/user-state';
import { WebSocketState } from 'src/app/interfaces/state/websocket-state';
import { LqState } from 'src/app/interfaces/state/lq-state';


/**
 * As mentioned, we treat each reducer like a table in a database. This means
 * our top level state interface is just a map of keys to inner state types.
 */
export interface AppState {
  router: fromRouter.RouterReducerState<NgrxRouterStateUrl>;
  dashboards: api.Dashboard[];
  errors: api.SwError[];
  files: api.CatalogFile[];
  layout: LayoutState;
  mconfigs: api.Mconfig[];
  members: api.Member[];
  models: api.Model[];
  payments: api.Payment[];
  projects: api.Project[];
  queries: api.Query[];
  repos: api.Repo[];
  subscriptions: api.Subscription[];
  user: UserState;
  webSocket: WebSocketState;
  lq: LqState;
}
