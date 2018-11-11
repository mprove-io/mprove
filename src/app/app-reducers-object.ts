import * as fromRouter from '@ngrx/router-store';
/**
 * Every reducer module's default export is the reducer function itself. In
 * addition, each module should export a type or interface that describes
 * the state of the reducer plus any selector functions. The `* as`
 * notation packages up all of the exports into a single object.
 */
import { ActionReducerMap } from '@ngrx/store';
import * as interfaces from 'src/app/interfaces/_index';
import * as reducers from 'src/app/store/reducers/_index';


/**
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const APP_REDUCERS_OBJECT: ActionReducerMap<interfaces.AppState> = {

  router: fromRouter.routerReducer,

  dashboards: reducers.dashboardsReducer,
  errors: reducers.errorsReducer,
  files: reducers.filesReducer,
  layout: reducers.layoutReducer,
  mconfigs: reducers.mconfigsReducer,
  members: reducers.membersReducer,
  models: reducers.modelsReducer,
  payments: reducers.paymentsReducer,
  projects: reducers.projectsReducer,
  queries: reducers.queriesReducer,
  repos: reducers.reposReducer,
  subscriptions: reducers.subscriptionsReducer,
  user: reducers.userReducer,
  webSocket: reducers.webSocketReducer,
  lq: reducers.lqReducer,
};
