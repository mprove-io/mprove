import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromBlockmlError
} from '#common/zod/backend/errors/backend-error-response-from-blockml-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/zod/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMemberAlreadyExistsError,
  zBackendMemberAlreadyExistsError
} from '#common/zod/backend/errors/backend-member-already-exists-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotAdminError,
  zBackendMemberIsNotAdminError
} from '#common/zod/backend/errors/backend-member-is-not-admin-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
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
  type BackendUserAliasIsUndefinedError,
  zBackendUserAliasIsUndefinedError
} from '#common/zod/backend/errors/backend-user-alias-is-undefined-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendCreateMemberError =
  | BackendErrorResponseFromBlockmlError
  | BackendErrorResponseFromDiskError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberAlreadyExistsError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError
  | BackendProjectDoesNotExistError
  | BackendRestrictedUserError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendTransactionRetryError
  | BackendUserAliasIsUndefinedError
  | BackendWrongTotalDiskShardsError;

export let zToBackendCreateMemberError = z.discriminatedUnion('code', [
  zBackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromDiskError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberAlreadyExistsError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError,
  zBackendProjectDoesNotExistError,
  zBackendRestrictedUserError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendTransactionRetryError,
  zBackendUserAliasIsUndefinedError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendCreateMemberError,
  z.infer<typeof zToBackendCreateMemberError>
>({ value: true });
