import type { BackendApiHostIsBlockedByListError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-list-error';
import type { BackendApiInvalidUrlError } from '#common/types/backend/errors/backend-api-invalid-url-error';
import type { BackendApiProtocolMustBeHttpsOrHttpError } from '#common/types/backend/errors/backend-api-protocol-must-be-https-or-http-error';
import type { CheckApiHostnameError } from '#common/types/backend/function-errors/check-api-hostname-error';

export type CheckApiUrlError =
  | CheckApiHostnameError
  | BackendApiHostIsBlockedByListError
  | BackendApiInvalidUrlError
  | BackendApiProtocolMustBeHttpsOrHttpError;
