import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendApiHostDnsLookupFailedError,
  zBackendApiHostDnsLookupFailedError
} from '#common/zod/backend/errors/backend-api-host-dns-lookup-failed-error';
import {
  type BackendApiHostIsBlockedByIpError,
  zBackendApiHostIsBlockedByIpError
} from '#common/zod/backend/errors/backend-api-host-is-blocked-by-ip-error';
import {
  type BackendApiHostIsBlockedByListError,
  zBackendApiHostIsBlockedByListError
} from '#common/zod/backend/errors/backend-api-host-is-blocked-by-list-error';
import {
  type BackendApiHostIsBlockedBySpecError,
  zBackendApiHostIsBlockedBySpecError
} from '#common/zod/backend/errors/backend-api-host-is-blocked-by-spec-error';
import {
  type BackendApiHostIsBlockedBySuffixError,
  zBackendApiHostIsBlockedBySuffixError
} from '#common/zod/backend/errors/backend-api-host-is-blocked-by-suffix-error';
import {
  type BackendApiInvalidUrlError,
  zBackendApiInvalidUrlError
} from '#common/zod/backend/errors/backend-api-invalid-url-error';
import {
  type BackendApiProtocolMustBeHttpsOrHttpError,
  zBackendApiProtocolMustBeHttpsOrHttpError
} from '#common/zod/backend/errors/backend-api-protocol-must-be-https-or-http-error';
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
  type BackendConnectionDoesNotExistError,
  zBackendConnectionDoesNotExistError
} from '#common/zod/backend/errors/backend-connection-does-not-exist-error';
import {
  type BackendCreateChartFailError,
  zBackendCreateChartFailError
} from '#common/zod/backend/errors/backend-create-chart-fail-error';
import {
  type BackendDashboardCreatorIdMismatchError,
  zBackendDashboardCreatorIdMismatchError
} from '#common/zod/backend/errors/backend-dashboard-creator-id-mismatch-error';
import {
  type BackendDashboardDoesNotExistError,
  zBackendDashboardDoesNotExistError
} from '#common/zod/backend/errors/backend-dashboard-does-not-exist-error';
import {
  type BackendDatabricksFailedToCloseConnectionError,
  zBackendDatabricksFailedToCloseConnectionError
} from '#common/zod/backend/errors/backend-databricks-failed-to-close-connection-error';
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
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/zod/backend/errors/backend-member-does-not-have-access-to-env-error';
import {
  type BackendModelDoesNotExistError,
  zBackendModelDoesNotExistError
} from '#common/zod/backend/errors/backend-model-does-not-exist-error';
import {
  type BackendModelIdIsNotDefinedError,
  zBackendModelIdIsNotDefinedError
} from '#common/zod/backend/errors/backend-model-id-is-not-defined-error';
import {
  type BackendMysqlConnectionCloseError,
  zBackendMysqlConnectionCloseError
} from '#common/zod/backend/errors/backend-mysql-connection-close-error';
import {
  type BackendProductionRepoNotAllowedError,
  zBackendProductionRepoNotAllowedError
} from '#common/zod/backend/errors/backend-production-repo-not-allowed-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendQueriesDoNotExistError,
  zBackendQueriesDoNotExistError
} from '#common/zod/backend/errors/backend-queries-do-not-exist-error';
import {
  type BackendQueryDoesNotExistError,
  zBackendQueryDoesNotExistError
} from '#common/zod/backend/errors/backend-query-does-not-exist-error';
import {
  type BackendReportCreatorIdMismatchError,
  zBackendReportCreatorIdMismatchError
} from '#common/zod/backend/errors/backend-report-creator-id-mismatch-error';
import {
  type BackendReportNotFoundError,
  zBackendReportNotFoundError
} from '#common/zod/backend/errors/backend-report-not-found-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/zod/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/zod/backend/errors/backend-rpc-timeout-error';
import {
  type BackendRunQueriesPoolError,
  zBackendRunQueriesPoolError
} from '#common/zod/backend/errors/backend-run-queries-pool-error';
import {
  type BackendRunQueryApiError,
  zBackendRunQueryApiError
} from '#common/zod/backend/errors/backend-run-query-api-error';
import {
  type BackendRunQueryDatabricksError,
  zBackendRunQueryDatabricksError
} from '#common/zod/backend/errors/backend-run-query-databricks-error';
import {
  type BackendRunQueryDuckdbError,
  zBackendRunQueryDuckdbError
} from '#common/zod/backend/errors/backend-run-query-duckdb-error';
import {
  type BackendRunQueryMysqlError,
  zBackendRunQueryMysqlError
} from '#common/zod/backend/errors/backend-run-query-mysql-error';
import {
  type BackendRunQueryPostgresError,
  zBackendRunQueryPostgresError
} from '#common/zod/backend/errors/backend-run-query-postgres-error';
import {
  type BackendRunQueryPrestoError,
  zBackendRunQueryPrestoError
} from '#common/zod/backend/errors/backend-run-query-presto-error';
import {
  type BackendRunQuerySnowflakeError,
  zBackendRunQuerySnowflakeError
} from '#common/zod/backend/errors/backend-run-query-snowflake-error';
import {
  type BackendRunQueryTrinoError,
  zBackendRunQueryTrinoError
} from '#common/zod/backend/errors/backend-run-query-trino-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/zod/backend/errors/backend-session-not-found-error';
import {
  type BackendSessionTypeIsNotExplorerError,
  zBackendSessionTypeIsNotExplorerError
} from '#common/zod/backend/errors/backend-session-type-is-not-explorer-error';
import {
  type BackendSnowflakeFailedToDestroyConnectionError,
  zBackendSnowflakeFailedToDestroyConnectionError
} from '#common/zod/backend/errors/backend-snowflake-failed-to-destroy-connection-error';
import {
  type BackendStructDoesNotExistError,
  zBackendStructDoesNotExistError
} from '#common/zod/backend/errors/backend-struct-does-not-exist-error';
import {
  type BackendSuggestFieldNotFoundError,
  zBackendSuggestFieldNotFoundError
} from '#common/zod/backend/errors/backend-suggest-field-not-found-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';

export type ToBackendProduceExplorerChartError =
  | BackendApiHostDnsLookupFailedError
  | BackendApiHostIsBlockedByIpError
  | BackendApiHostIsBlockedByListError
  | BackendApiHostIsBlockedBySpecError
  | BackendApiHostIsBlockedBySuffixError
  | BackendApiInvalidUrlError
  | BackendApiProtocolMustBeHttpsOrHttpError
  | BackendBranchDoesNotExistError
  | BackendBridgeBranchEnvDoesNotExistError
  | BackendChartCreatorIdMismatchError
  | BackendChartDoesNotExistError
  | BackendConnectionDoesNotExistError
  | BackendCreateChartFailError
  | BackendDashboardCreatorIdMismatchError
  | BackendDashboardDoesNotExistError
  | BackendDatabricksFailedToCloseConnectionError
  | BackendEnvDoesNotExistError
  | BackendErrorResponseFromBlockmlError
  | BackendForbiddenDashboardError
  | BackendForbiddenModelError
  | BackendForbiddenReportError
  | BackendForbiddenRepoIdError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendModelDoesNotExistError
  | BackendModelIdIsNotDefinedError
  | BackendMysqlConnectionCloseError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError
  | BackendQueriesDoNotExistError
  | BackendQueryDoesNotExistError
  | BackendReportCreatorIdMismatchError
  | BackendReportNotFoundError
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendRunQueriesPoolError
  | BackendRunQueryApiError
  | BackendRunQueryDatabricksError
  | BackendRunQueryDuckdbError
  | BackendRunQueryMysqlError
  | BackendRunQueryPostgresError
  | BackendRunQueryPrestoError
  | BackendRunQuerySnowflakeError
  | BackendRunQueryTrinoError
  | BackendSessionNotFoundError
  | BackendSessionTypeIsNotExplorerError
  | BackendSnowflakeFailedToDestroyConnectionError
  | BackendStructDoesNotExistError
  | BackendSuggestFieldNotFoundError
  | BackendTransactionRetryError;

export let zToBackendProduceExplorerChartError = z.discriminatedUnion('code', [
  zBackendApiHostDnsLookupFailedError,
  zBackendApiHostIsBlockedByIpError,
  zBackendApiHostIsBlockedByListError,
  zBackendApiHostIsBlockedBySpecError,
  zBackendApiHostIsBlockedBySuffixError,
  zBackendApiInvalidUrlError,
  zBackendApiProtocolMustBeHttpsOrHttpError,
  zBackendBranchDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError,
  zBackendChartCreatorIdMismatchError,
  zBackendChartDoesNotExistError,
  zBackendConnectionDoesNotExistError,
  zBackendCreateChartFailError,
  zBackendDashboardCreatorIdMismatchError,
  zBackendDashboardDoesNotExistError,
  zBackendDatabricksFailedToCloseConnectionError,
  zBackendEnvDoesNotExistError,
  zBackendErrorResponseFromBlockmlError,
  zBackendForbiddenDashboardError,
  zBackendForbiddenModelError,
  zBackendForbiddenReportError,
  zBackendForbiddenRepoIdError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zBackendModelDoesNotExistError,
  zBackendModelIdIsNotDefinedError,
  zBackendMysqlConnectionCloseError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError,
  zBackendQueriesDoNotExistError,
  zBackendQueryDoesNotExistError,
  zBackendReportCreatorIdMismatchError,
  zBackendReportNotFoundError,
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendRunQueriesPoolError,
  zBackendRunQueryApiError,
  zBackendRunQueryDatabricksError,
  zBackendRunQueryDuckdbError,
  zBackendRunQueryMysqlError,
  zBackendRunQueryPostgresError,
  zBackendRunQueryPrestoError,
  zBackendRunQuerySnowflakeError,
  zBackendRunQueryTrinoError,
  zBackendSessionNotFoundError,
  zBackendSessionTypeIsNotExplorerError,
  zBackendSnowflakeFailedToDestroyConnectionError,
  zBackendStructDoesNotExistError,
  zBackendSuggestFieldNotFoundError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendProduceExplorerChartError,
  z.infer<typeof zToBackendProduceExplorerChartError>
>({ value: true });
