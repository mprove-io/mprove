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
  type BackendDateConversionFailedError,
  zBackendDateConversionFailedError
} from '#common/zod/backend/errors/backend-date-conversion-failed-error';
import {
  type BackendEnvDoesNotExistError,
  zBackendEnvDoesNotExistError
} from '#common/zod/backend/errors/backend-env-does-not-exist-error';
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
  type BackendForbiddenReportError,
  zBackendForbiddenReportError
} from '#common/zod/backend/errors/backend-forbidden-report-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMalloyConnectionCloseError,
  zBackendMalloyConnectionCloseError
} from '#common/zod/backend/errors/backend-malloy-connection-close-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/zod/backend/errors/backend-member-does-not-have-access-to-env-error';
import {
  type BackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotEditorOrAdminError
} from '#common/zod/backend/errors/backend-member-is-not-editor-or-admin-error';
import {
  type BackendMemberIsNotExplorerError,
  zBackendMemberIsNotExplorerError
} from '#common/zod/backend/errors/backend-member-is-not-explorer-error';
import {
  type BackendModifyReportFailError,
  zBackendModifyReportFailError
} from '#common/zod/backend/errors/backend-modify-report-fail-error';
import {
  type BackendProductionRepoNotAllowedError,
  zBackendProductionRepoNotAllowedError
} from '#common/zod/backend/errors/backend-production-repo-not-allowed-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendReportCreatorIdMismatchError,
  zBackendReportCreatorIdMismatchError
} from '#common/zod/backend/errors/backend-report-creator-id-mismatch-error';
import {
  type BackendReportNotFoundError,
  zBackendReportNotFoundError
} from '#common/zod/backend/errors/backend-report-not-found-error';
import {
  type BackendRestrictedProjectError,
  zBackendRestrictedProjectError
} from '#common/zod/backend/errors/backend-restricted-project-error';
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
  type BackendStructDoesNotExistError,
  zBackendStructDoesNotExistError
} from '#common/zod/backend/errors/backend-struct-does-not-exist-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BackendWrongTimeRangeError,
  zBackendWrongTimeRangeError
} from '#common/zod/backend/errors/backend-wrong-time-range-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';
import {
  type BlockmlUnexpectedUrlReadError,
  zBlockmlUnexpectedUrlReadError
} from '#common/zod/backend/errors/blockml-unexpected-url-read-error';
import {
  type MalloyToQueryFailedError,
  zMalloyToQueryFailedError
} from '#common/zod/backend/errors/malloy-to-query-failed-error';

export type ToBackendSaveModifyReportError =
  | BackendBranchDoesNotExistError
  | BackendBridgeBranchEnvDoesNotExistError
  | BackendDateConversionFailedError
  | BackendEnvDoesNotExistError
  | BackendErrorResponseFromBlockmlError
  | BackendErrorResponseFromDiskError
  | BackendForbiddenReportError
  | BackendForbiddenRepoIdError
  | BackendHashSecretIsNotDefinedError
  | BackendMalloyConnectionCloseError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendMemberIsNotEditorOrAdminError
  | BackendMemberIsNotExplorerError
  | BackendModifyReportFailError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError
  | BackendReportCreatorIdMismatchError
  | BackendReportNotFoundError
  | BackendRestrictedProjectError
  | BackendRestrictedUserError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendStructDoesNotExistError
  | BackendTransactionRetryError
  | BackendWrongTimeRangeError
  | BackendWrongTotalDiskShardsError
  | BlockmlUnexpectedUrlReadError
  | MalloyToQueryFailedError;

export let zToBackendSaveModifyReportError = z.discriminatedUnion('code', [
  zBackendBranchDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError,
  zBackendDateConversionFailedError,
  zBackendEnvDoesNotExistError,
  zBackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromDiskError,
  zBackendForbiddenReportError,
  zBackendForbiddenRepoIdError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMalloyConnectionCloseError,
  zBackendMemberDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotExplorerError,
  zBackendModifyReportFailError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError,
  zBackendReportCreatorIdMismatchError,
  zBackendReportNotFoundError,
  zBackendRestrictedProjectError,
  zBackendRestrictedUserError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendStructDoesNotExistError,
  zBackendTransactionRetryError,
  zBackendWrongTimeRangeError,
  zBackendWrongTotalDiskShardsError,
  zBlockmlUnexpectedUrlReadError,
  zMalloyToQueryFailedError
]);

assertTypesEqual<
  ToBackendSaveModifyReportError,
  z.infer<typeof zToBackendSaveModifyReportError>
>({ value: true });
