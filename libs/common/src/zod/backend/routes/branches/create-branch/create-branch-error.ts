import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBranchAlreadyExistsError,
  zBackendBranchAlreadyExistsError
} from '#common/zod/backend/errors/backend-branch-already-exists-error';
import {
  type BackendBranchDoesNotExistError,
  zBackendBranchDoesNotExistError
} from '#common/zod/backend/errors/backend-branch-does-not-exist-error';
import {
  type BackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromBlockmlError
} from '#common/zod/backend/errors/backend-error-response-from-blockml-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/zod/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendForbiddenRepoIdError,
  zBackendForbiddenRepoIdError
} from '#common/zod/backend/errors/backend-forbidden-repo-id-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotEditorError,
  zBackendMemberIsNotEditorError
} from '#common/zod/backend/errors/backend-member-is-not-editor-error';
import {
  type BackendProductionRepoNotAllowedError,
  zBackendProductionRepoNotAllowedError
} from '#common/zod/backend/errors/backend-production-repo-not-allowed-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/zod/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/zod/backend/errors/backend-rpc-timeout-error';
import {
  type BackendSessionBranchCannotBeCreatedError,
  zBackendSessionBranchCannotBeCreatedError
} from '#common/zod/backend/errors/backend-session-branch-cannot-be-created-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendCreateBranchError =
  | BackendBranchAlreadyExistsError
  | BackendBranchDoesNotExistError
  | BackendErrorResponseFromBlockmlError
  | BackendErrorResponseFromDiskError
  | BackendForbiddenRepoIdError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotEditorError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendSessionBranchCannotBeCreatedError
  | BackendTransactionRetryError
  | BackendWrongTotalDiskShardsError;

export let zToBackendCreateBranchError = z.discriminatedUnion('code', [
  zBackendBranchAlreadyExistsError,
  zBackendBranchDoesNotExistError,
  zBackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromDiskError,
  zBackendForbiddenRepoIdError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotEditorError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendSessionBranchCannotBeCreatedError,
  zBackendTransactionRetryError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendCreateBranchError,
  z.infer<typeof zToBackendCreateBranchError>
>({ value: true });
