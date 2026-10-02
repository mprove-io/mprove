import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendApiHostDnsLookupFailedError,
  zBackendApiHostDnsLookupFailedError
} from '#common/types/backend/errors/backend-api-host-dns-lookup-failed-error';
import {
  type BackendApiHostIsBlockedByIpError,
  zBackendApiHostIsBlockedByIpError
} from '#common/types/backend/errors/backend-api-host-is-blocked-by-ip-error';
import {
  type BackendApiHostIsBlockedByListError,
  zBackendApiHostIsBlockedByListError
} from '#common/types/backend/errors/backend-api-host-is-blocked-by-list-error';
import {
  type BackendApiHostIsBlockedBySpecError,
  zBackendApiHostIsBlockedBySpecError
} from '#common/types/backend/errors/backend-api-host-is-blocked-by-spec-error';
import {
  type BackendApiHostIsBlockedBySuffixError,
  zBackendApiHostIsBlockedBySuffixError
} from '#common/types/backend/errors/backend-api-host-is-blocked-by-suffix-error';
import {
  type BackendApiInvalidUrlError,
  zBackendApiInvalidUrlError
} from '#common/types/backend/errors/backend-api-invalid-url-error';
import {
  type BackendApiProtocolMustBeHttpsOrHttpError,
  zBackendApiProtocolMustBeHttpsOrHttpError
} from '#common/types/backend/errors/backend-api-protocol-must-be-https-or-http-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotAdminError,
  zBackendMemberIsNotAdminError
} from '#common/types/backend/errors/backend-member-is-not-admin-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendProviderAlreadyExistsError,
  zBackendProviderAlreadyExistsError
} from '#common/types/backend/errors/backend-provider-already-exists-error';
import {
  type BackendProviderTypeMismatchError,
  zBackendProviderTypeMismatchError
} from '#common/types/backend/errors/backend-provider-type-mismatch-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';

export type ToBackendCreateProviderError =
  | BackendApiHostDnsLookupFailedError
  | BackendApiHostIsBlockedByIpError
  | BackendApiHostIsBlockedByListError
  | BackendApiHostIsBlockedBySpecError
  | BackendApiHostIsBlockedBySuffixError
  | BackendApiInvalidUrlError
  | BackendApiProtocolMustBeHttpsOrHttpError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError
  | BackendProjectDoesNotExistError
  | BackendProviderAlreadyExistsError
  | BackendProviderTypeMismatchError
  | BackendTransactionRetryError;

export let zToBackendCreateProviderError = z.discriminatedUnion('code', [
  zBackendApiHostDnsLookupFailedError,
  zBackendApiHostIsBlockedByIpError,
  zBackendApiHostIsBlockedByListError,
  zBackendApiHostIsBlockedBySpecError,
  zBackendApiHostIsBlockedBySuffixError,
  zBackendApiInvalidUrlError,
  zBackendApiProtocolMustBeHttpsOrHttpError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError,
  zBackendProjectDoesNotExistError,
  zBackendProviderAlreadyExistsError,
  zBackendProviderTypeMismatchError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendCreateProviderError,
  z.infer<typeof zToBackendCreateProviderError>
>({ value: true });
