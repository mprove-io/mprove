import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBranchDoesNotExistError,
  zBackendBranchDoesNotExistError
} from '#common/zod/backend/errors/backend-branch-does-not-exist-error';
import {
  type BackendEditorSessionLockFailedError,
  zBackendEditorSessionLockFailedError
} from '#common/zod/backend/errors/backend-editor-session-lock-failed-error';
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
  type BackendManualCommitToProductionRepoIsForbiddenError,
  zBackendManualCommitToProductionRepoIsForbiddenError
} from '#common/zod/backend/errors/backend-manual-commit-to-production-repo-is-forbidden-error';
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
  type BackendRestrictedProjectError,
  zBackendRestrictedProjectError
} from '#common/zod/backend/errors/backend-restricted-project-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/zod/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/zod/backend/errors/backend-rpc-timeout-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/zod/backend/errors/backend-session-not-found-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BackendUnknownSandboxTypeError,
  zBackendUnknownSandboxTypeError
} from '#common/zod/backend/errors/backend-unknown-sandbox-type-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendCommitRepoError =
  | BackendBranchDoesNotExistError
  | BackendEditorSessionLockFailedError
  | BackendErrorResponseFromDiskError
  | BackendForbiddenRepoIdError
  | BackendHashSecretIsNotDefinedError
  | BackendManualCommitToProductionRepoIsForbiddenError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotEditorError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError
  | BackendRestrictedProjectError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendSessionNotFoundError
  | BackendTransactionRetryError
  | BackendUnknownSandboxTypeError
  | BackendWrongTotalDiskShardsError;

export let zToBackendCommitRepoError = z.discriminatedUnion('code', [
  zBackendBranchDoesNotExistError,
  zBackendEditorSessionLockFailedError,
  zBackendErrorResponseFromDiskError,
  zBackendForbiddenRepoIdError,
  zBackendHashSecretIsNotDefinedError,
  zBackendManualCommitToProductionRepoIsForbiddenError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotEditorError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError,
  zBackendRestrictedProjectError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendSessionNotFoundError,
  zBackendTransactionRetryError,
  zBackendUnknownSandboxTypeError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendCommitRepoError,
  z.infer<typeof zToBackendCommitRepoError>
>({ value: true });
