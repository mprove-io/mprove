import type { BackendApiHostDnsLookupFailedError } from '#common/types/backend/errors/backend-api-host-dns-lookup-failed-error';
import type { BackendApiHostIsBlockedBySpecError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-spec-error';
import type { BackendApiHostIsBlockedBySuffixError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-suffix-error';
import type { IsPrivateIpError } from '#common/types/backend/function-errors/is-private-ip-error';

export type CheckApiHostnameError =
  | BackendApiHostDnsLookupFailedError
  | BackendApiHostIsBlockedBySpecError
  | BackendApiHostIsBlockedBySuffixError
  | IsPrivateIpError;
