import * as fromRouter from '@ngrx/router-store';
import * as api from '@app/api/_index';
import { NgrxRouterStateUrl } from '@app/interfaces/ngrx-router-state-url';
import { LayoutState } from '@app/interfaces/state/layout-state';
import { UserState } from '@app/interfaces/state/user-state';
import { WebSocketState } from '@app/interfaces/state/websocket-state';
import { LqState } from '@app/interfaces/state/lq-state';

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
  views: api.View[];
  projects: api.Project[];
  queries: api.Query[];
  repos: api.Repo[];
  user: UserState;
  webSocket: WebSocketState;
  lq: LqState;
}
