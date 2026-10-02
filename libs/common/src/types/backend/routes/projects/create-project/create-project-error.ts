import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromBlockmlError
} from '#common/types/backend/errors/backend-error-response-from-blockml-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/types/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendNoteDoesNotExistError,
  zBackendNoteDoesNotExistError
} from '#common/types/backend/errors/backend-note-does-not-exist-error';
import {
  type BackendOnlyOrgOwnerCanAccessError,
  zBackendOnlyOrgOwnerCanAccessError
} from '#common/types/backend/errors/backend-only-org-owner-can-access-error';
import {
  type BackendOrgDoesNotExistError,
  zBackendOrgDoesNotExistError
} from '#common/types/backend/errors/backend-org-does-not-exist-error';
import {
  type BackendProjectAlreadyExistsError,
  zBackendProjectAlreadyExistsError
} from '#common/types/backend/errors/backend-project-already-exists-error';
import {
  type BackendRestrictedOrganizationError,
  zBackendRestrictedOrganizationError
} from '#common/types/backend/errors/backend-restricted-organization-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/types/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/types/backend/errors/backend-rpc-timeout-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/types/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendCreateProjectError =
  | BackendErrorResponseFromBlockmlError
  | BackendErrorResponseFromDiskError
  | BackendHashSecretIsNotDefinedError
  | BackendNoteDoesNotExistError
  | BackendOnlyOrgOwnerCanAccessError
  | BackendOrgDoesNotExistError
  | BackendProjectAlreadyExistsError
  | BackendRestrictedOrganizationError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendTransactionRetryError
  | BackendWrongTotalDiskShardsError;

export let zToBackendCreateProjectError = z.discriminatedUnion('code', [
  zBackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromDiskError,
  zBackendHashSecretIsNotDefinedError,
  zBackendNoteDoesNotExistError,
  zBackendOnlyOrgOwnerCanAccessError,
  zBackendOrgDoesNotExistError,
  zBackendProjectAlreadyExistsError,
  zBackendRestrictedOrganizationError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendTransactionRetryError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendCreateProjectError,
  z.infer<typeof zToBackendCreateProjectError>
>({ value: true });
