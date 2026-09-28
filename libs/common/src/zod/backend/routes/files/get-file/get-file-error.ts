import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBranchDoesNotExistError,
  zBackendBranchDoesNotExistError
} from '#common/zod/backend/errors/backend-branch-does-not-exist-error';
import {
  type BackendBridgeBranchEnvDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError
} from '#common/zod/backend/errors/backend-bridge-branch-env-does-not-exist-error';
import {
  type BackendEnvDoesNotExistError,
  zBackendEnvDoesNotExistError
} from '#common/zod/backend/errors/backend-env-does-not-exist-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/zod/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendForbiddenRepoIdError,
  zBackendForbiddenRepoIdError
} from '#common/zod/backend/errors/backend-forbidden-repo-id-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/zod/backend/errors/backend-member-does-not-have-access-to-env-error';
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
  type BackendStructDoesNotExistError,
  zBackendStructDoesNotExistError
} from '#common/zod/backend/errors/backend-struct-does-not-exist-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendGetFileError =
  | BackendBranchDoesNotExistError
  | BackendBridgeBranchEnvDoesNotExistError
  | BackendEnvDoesNotExistError
  | BackendErrorResponseFromDiskError
  | BackendForbiddenRepoIdError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendStructDoesNotExistError
  | BackendWrongTotalDiskShardsError;

export let zToBackendGetFileError = z.discriminatedUnion('code', [
  zBackendBranchDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError,
  zBackendEnvDoesNotExistError,
  zBackendErrorResponseFromDiskError,
  zBackendForbiddenRepoIdError,
  zBackendMemberDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendStructDoesNotExistError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<ToBackendGetFileError, z.infer<typeof zToBackendGetFileError>>(
  { value: true }
);
