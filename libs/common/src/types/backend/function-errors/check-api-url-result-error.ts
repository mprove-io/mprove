import type { BackendApiHostDnsLookupFailedError } from '#common/types/backend/errors/backend-api-host-dns-lookup-failed-error';
import type { BackendApiHostIsBlockedByIpError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-ip-error';
import type { BackendApiHostIsBlockedByListError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-list-error';
import type { BackendApiHostIsBlockedBySpecError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-spec-error';
import type { BackendApiHostIsBlockedBySuffixError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-suffix-error';
import type { BackendApiInvalidUrlError } from '#common/types/backend/errors/backend-api-invalid-url-error';
import type { BackendApiProtocolMustBeHttpsOrHttpError } from '#common/types/backend/errors/backend-api-protocol-must-be-https-or-http-error';

export type CheckApiUrlResultError =
  | BackendApiHostDnsLookupFailedError
  | BackendApiHostIsBlockedByIpError
  | BackendApiHostIsBlockedByListError
  | BackendApiHostIsBlockedBySpecError
  | BackendApiHostIsBlockedBySuffixError
  | BackendApiInvalidUrlError
  | BackendApiProtocolMustBeHttpsOrHttpError;
