import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/zod/backend/errors/backend-error-response-from-disk-error';
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
  type BackendUserIsOrgOwnerError,
  zBackendUserIsOrgOwnerError
} from '#common/zod/backend/errors/backend-user-is-org-owner-error';
import {
  type BackendUserIsTheOnlyProjectAdminError,
  zBackendUserIsTheOnlyProjectAdminError
} from '#common/zod/backend/errors/backend-user-is-the-only-project-admin-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendDeleteUserError =
  | BackendErrorResponseFromDiskError
  | BackendRestrictedUserError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendTransactionRetryError
  | BackendUserIsOrgOwnerError
  | BackendUserIsTheOnlyProjectAdminError
  | BackendWrongTotalDiskShardsError;

export let zToBackendDeleteUserError = z.discriminatedUnion('code', [
  zBackendErrorResponseFromDiskError,
  zBackendRestrictedUserError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendTransactionRetryError,
  zBackendUserIsOrgOwnerError,
  zBackendUserIsTheOnlyProjectAdminError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendDeleteUserError,
  z.infer<typeof zToBackendDeleteUserError>
>({ value: true });
