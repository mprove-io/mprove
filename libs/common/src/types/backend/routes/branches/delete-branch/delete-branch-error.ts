import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendDefaultBranchCannotBeDeletedError,
  zBackendDefaultBranchCannotBeDeletedError
} from '#common/types/backend/errors/backend-default-branch-cannot-be-deleted-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/types/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendForbiddenRepoIdError,
  zBackendForbiddenRepoIdError
} from '#common/types/backend/errors/backend-forbidden-repo-id-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotEditorError,
  zBackendMemberIsNotEditorError
} from '#common/types/backend/errors/backend-member-is-not-editor-error';
import {
  type BackendProductionRepoNotAllowedError,
  zBackendProductionRepoNotAllowedError
} from '#common/types/backend/errors/backend-production-repo-not-allowed-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendRestrictedProjectError,
  zBackendRestrictedProjectError
} from '#common/types/backend/errors/backend-restricted-project-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/types/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/types/backend/errors/backend-rpc-timeout-error';
import {
  type BackendSessionBranchCannotBeDeletedError,
  zBackendSessionBranchCannotBeDeletedError
} from '#common/types/backend/errors/backend-session-branch-cannot-be-deleted-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/types/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendDeleteBranchError =
  | BackendDefaultBranchCannotBeDeletedError
  | BackendErrorResponseFromDiskError
  | BackendForbiddenRepoIdError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotEditorError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError
  | BackendRestrictedProjectError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendSessionBranchCannotBeDeletedError
  | BackendTransactionRetryError
  | BackendWrongTotalDiskShardsError;

export let zToBackendDeleteBranchError = z.discriminatedUnion('code', [
  zBackendDefaultBranchCannotBeDeletedError,
  zBackendErrorResponseFromDiskError,
  zBackendForbiddenRepoIdError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotEditorError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError,
  zBackendRestrictedProjectError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendSessionBranchCannotBeDeletedError,
  zBackendTransactionRetryError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendDeleteBranchError,
  z.infer<typeof zToBackendDeleteBranchError>
>({ value: true });
