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
  type BackendChartCreatorIdMismatchError,
  zBackendChartCreatorIdMismatchError
} from '#common/zod/backend/errors/backend-chart-creator-id-mismatch-error';
import {
  type BackendChartDoesNotExistError,
  zBackendChartDoesNotExistError
} from '#common/zod/backend/errors/backend-chart-does-not-exist-error';
import {
  type BackendDashboardCreatorIdMismatchError,
  zBackendDashboardCreatorIdMismatchError
} from '#common/zod/backend/errors/backend-dashboard-creator-id-mismatch-error';
import {
  type BackendDashboardDoesNotExistError,
  zBackendDashboardDoesNotExistError
} from '#common/zod/backend/errors/backend-dashboard-does-not-exist-error';
import {
  type BackendDashboardIdChartIdAndReportIdAreNotDefinedError,
  zBackendDashboardIdChartIdAndReportIdAreNotDefinedError
} from '#common/zod/backend/errors/backend-dashboard-id-chart-id-and-report-id-are-not-defined-error';
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
  type BackendForbiddenDashboardError,
  zBackendForbiddenDashboardError
} from '#common/zod/backend/errors/backend-forbidden-dashboard-error';
import {
  type BackendForbiddenModelError,
  zBackendForbiddenModelError
} from '#common/zod/backend/errors/backend-forbidden-model-error';
import {
  type BackendForbiddenRepoIdError,
  zBackendForbiddenRepoIdError
} from '#common/zod/backend/errors/backend-forbidden-repo-id-error';
import {
  type BackendForbiddenReportError,
  zBackendForbiddenReportError
} from '#common/zod/backend/errors/backend-forbidden-report-error';
import {
  type BackendGetDashboardFailError,
  zBackendGetDashboardFailError
} from '#common/zod/backend/errors/backend-get-dashboard-fail-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMalloyConnectionCloseError,
  zBackendMalloyConnectionCloseError
} from '#common/zod/backend/errors/backend-malloy-connection-close-error';
import {
  type BackendMconfigDoesNotExistError,
  zBackendMconfigDoesNotExistError
} from '#common/zod/backend/errors/backend-mconfig-does-not-exist-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/zod/backend/errors/backend-member-does-not-have-access-to-env-error';
import {
  type BackendMemberIsNotExplorerError,
  zBackendMemberIsNotExplorerError
} from '#common/zod/backend/errors/backend-member-is-not-explorer-error';
import {
  type BackendModelDoesNotExistError,
  zBackendModelDoesNotExistError
} from '#common/zod/backend/errors/backend-model-does-not-exist-error';
import {
  type BackendMutuallyExclusiveParamsError,
  zBackendMutuallyExclusiveParamsError
} from '#common/zod/backend/errors/backend-mutually-exclusive-params-error';
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
  type BackendRowIdDoesNotWorkWithoutReportIdError,
  zBackendRowIdDoesNotWorkWithoutReportIdError
} from '#common/zod/backend/errors/backend-row-id-does-not-work-without-report-id-error';
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
  type BackendTileIndexDoesNotWorkWithoutDashboardIdError,
  zBackendTileIndexDoesNotWorkWithoutDashboardIdError
} from '#common/zod/backend/errors/backend-tile-index-does-not-work-without-dashboard-id-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BackendWrongTimeRangeError,
  zBackendWrongTimeRangeError
} from '#common/zod/backend/errors/backend-wrong-time-range-error';
import {
  type BlockmlUnexpectedUrlReadError,
  zBlockmlUnexpectedUrlReadError
} from '#common/zod/backend/errors/blockml-unexpected-url-read-error';
import {
  type MalloyToQueryFailedError,
  zMalloyToQueryFailedError
} from '#common/zod/backend/errors/malloy-to-query-failed-error';

export type ToBackendGetQueryInfoError =
  | BackendBranchDoesNotExistError
  | BackendBridgeBranchEnvDoesNotExistError
  | BackendChartCreatorIdMismatchError
  | BackendChartDoesNotExistError
  | BackendDashboardCreatorIdMismatchError
  | BackendDashboardDoesNotExistError
  | BackendDashboardIdChartIdAndReportIdAreNotDefinedError
  | BackendDateConversionFailedError
  | BackendEnvDoesNotExistError
  | BackendErrorResponseFromBlockmlError
  | BackendForbiddenDashboardError
  | BackendForbiddenModelError
  | BackendForbiddenReportError
  | BackendForbiddenRepoIdError
  | BackendGetDashboardFailError
  | BackendHashSecretIsNotDefinedError
  | BackendMalloyConnectionCloseError
  | BackendMconfigDoesNotExistError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendMemberIsNotExplorerError
  | BackendModelDoesNotExistError
  | BackendMutuallyExclusiveParamsError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError
  | BackendReportCreatorIdMismatchError
  | BackendReportNotFoundError
  | BackendRowIdDoesNotWorkWithoutReportIdError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendStructDoesNotExistError
  | BackendTileIndexDoesNotWorkWithoutDashboardIdError
  | BackendTransactionRetryError
  | BackendWrongTimeRangeError
  | BlockmlUnexpectedUrlReadError
  | MalloyToQueryFailedError;

export let zToBackendGetQueryInfoError = z.discriminatedUnion('code', [
  zBackendBranchDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError,
  zBackendChartCreatorIdMismatchError,
  zBackendChartDoesNotExistError,
  zBackendDashboardCreatorIdMismatchError,
  zBackendDashboardDoesNotExistError,
  zBackendDashboardIdChartIdAndReportIdAreNotDefinedError,
  zBackendDateConversionFailedError,
  zBackendEnvDoesNotExistError,
  zBackendErrorResponseFromBlockmlError,
  zBackendForbiddenDashboardError,
  zBackendForbiddenModelError,
  zBackendForbiddenReportError,
  zBackendForbiddenRepoIdError,
  zBackendGetDashboardFailError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMalloyConnectionCloseError,
  zBackendMconfigDoesNotExistError,
  zBackendMemberDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberIsNotExplorerError,
  zBackendModelDoesNotExistError,
  zBackendMutuallyExclusiveParamsError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError,
  zBackendReportCreatorIdMismatchError,
  zBackendReportNotFoundError,
  zBackendRowIdDoesNotWorkWithoutReportIdError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendStructDoesNotExistError,
  zBackendTileIndexDoesNotWorkWithoutDashboardIdError,
  zBackendTransactionRetryError,
  zBackendWrongTimeRangeError,
  zBlockmlUnexpectedUrlReadError,
  zMalloyToQueryFailedError
]);

assertTypesEqual<
  ToBackendGetQueryInfoError,
  z.infer<typeof zToBackendGetQueryInfoError>
>({ value: true });
