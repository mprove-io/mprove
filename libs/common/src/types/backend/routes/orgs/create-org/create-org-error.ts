import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCreationOfOrganizationsIsForbiddenError,
  zBackendCreationOfOrganizationsIsForbiddenError
} from '#common/types/backend/errors/backend-creation-of-organizations-is-forbidden-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/types/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendOrgAlreadyExistsError,
  zBackendOrgAlreadyExistsError
} from '#common/types/backend/errors/backend-org-already-exists-error';
import {
  type BackendRestrictedOrganizationNameError,
  zBackendRestrictedOrganizationNameError
} from '#common/types/backend/errors/backend-restricted-organization-name-error';
import {
  type BackendRestrictedUserError,
  zBackendRestrictedUserError
} from '#common/types/backend/errors/backend-restricted-user-error';
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

export type ToBackendCreateOrgError =
  | BackendCreationOfOrganizationsIsForbiddenError
  | BackendErrorResponseFromDiskError
  | BackendHashSecretIsNotDefinedError
  | BackendOrgAlreadyExistsError
  | BackendRestrictedOrganizationNameError
  | BackendRestrictedUserError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendTransactionRetryError
  | BackendWrongTotalDiskShardsError;

export let zToBackendCreateOrgError = z.discriminatedUnion('code', [
  zBackendCreationOfOrganizationsIsForbiddenError,
  zBackendErrorResponseFromDiskError,
  zBackendHashSecretIsNotDefinedError,
  zBackendOrgAlreadyExistsError,
  zBackendRestrictedOrganizationNameError,
  zBackendRestrictedUserError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendTransactionRetryError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendCreateOrgError,
  z.infer<typeof zToBackendCreateOrgError>
>({ value: true });
