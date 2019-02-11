import { ngrxType } from '@app/ngrx/ngrx-type';

// see multiGetDashboardMconfigsQueries in code

export const CREATE_DASHBOARD = ngrxType('CREATE_DASHBOARD');
export const CREATE_DASHBOARD_SUCCESS = ngrxType('CREATE_DASHBOARD_SUCCESS');
export const CREATE_DASHBOARD_FAIL = ngrxType('CREATE_DASHBOARD_FAIL');

export const CREATE_MCONFIG_AND_QUERY = ngrxType('CREATE_MCONFIG_AND_QUERY');
export const CREATE_MCONFIG_AND_QUERY_SUCCESS = ngrxType(
  'CREATE_MCONFIG_AND_QUERY_SUCCESS'
);
export const CREATE_MCONFIG_AND_QUERY_FAIL = ngrxType(
  'CREATE_MCONFIG_AND_QUERY_FAIL'
);

export const SET_LIVE_QUERIES = ngrxType('SET_LIVE_QUERIES');
export const SET_LIVE_QUERIES_SUCCESS = ngrxType('SET_LIVE_QUERIES_SUCCESS');
export const SET_LIVE_QUERIES_FAIL = ngrxType('SET_LIVE_QUERIES_FAIL');
