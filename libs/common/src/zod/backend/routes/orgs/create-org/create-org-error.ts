import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCreationOfOrganizationsIsForbiddenError,
  zBackendCreationOfOrganizationsIsForbiddenError
} from '#common/zod/backend/errors/backend-creation-of-organizations-is-forbidden-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/zod/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendOrgAlreadyExistsError,
  zBackendOrgAlreadyExistsError
} from '#common/zod/backend/errors/backend-org-already-exists-error';
import {
  type BackendRestrictedOrganizationNameError,
  zBackendRestrictedOrganizationNameError
} from '#common/zod/backend/errors/backend-restricted-organization-name-error';
import {
  type BackendRestrictedUserError,
  zBackendRestrictedUserError
} from '#common/zod/backend/errors/backend-restricted-user-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/zod/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/zod/backend/errors/backend-rpc-timeout-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

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
