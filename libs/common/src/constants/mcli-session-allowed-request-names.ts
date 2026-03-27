import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';

export const MCLI_SESSION_ALLOWED_REQUEST_NAMES: ToBackendRequestInfoNameEnum[] =
  [
    ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas, // get-schemas
    ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample, // get-sample
    ToBackendRequestInfoNameEnum.ToBackendSyncRepo, // sync
    ToBackendRequestInfoNameEnum.ToBackendValidateFiles, // validate
    ToBackendRequestInfoNameEnum.ToBackendGetState, // get-state
    ToBackendRequestInfoNameEnum.ToBackendGetModel, // get-model
    ToBackendRequestInfoNameEnum.ToBackendGetQueryInfo, // get-query
    ToBackendRequestInfoNameEnum.ToBackendRun // run
  ];
