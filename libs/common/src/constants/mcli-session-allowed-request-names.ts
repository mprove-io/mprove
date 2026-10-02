import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

export const MCLI_SESSION_ALLOWED_REQUEST_NAMES: ToBackendRoute[] = [
  'api/ToBackendGetConnectionsList', // get-connections-list
  'api/ToBackendGetConnectionSample', // get-sample
  'api/ToBackendGetConnectionSchemas', // get-schemas
  'api/ToBackendSyncRepo', // sync
  'api/ToBackendValidateFiles', // validate
  'api/ToBackendGetState', // get-state
  'api/ToBackendGetModel', // get-model
  'api/ToBackendGetQueryInfo', // get-query-info
  'api/ToBackendRun' // run
];
