import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendApiHostDnsLookupFailedError,
  zBackendApiHostDnsLookupFailedError
} from '#common/types/backend/errors/backend-api-host-dns-lookup-failed-error';
import {
  type BackendApiHostIsBlockedByIpError,
  zBackendApiHostIsBlockedByIpError
} from '#common/types/backend/errors/backend-api-host-is-blocked-by-ip-error';
import {
  type BackendApiHostIsBlockedByListError,
  zBackendApiHostIsBlockedByListError
} from '#common/types/backend/errors/backend-api-host-is-blocked-by-list-error';
import {
  type BackendApiHostIsBlockedBySpecError,
  zBackendApiHostIsBlockedBySpecError
} from '#common/types/backend/errors/backend-api-host-is-blocked-by-spec-error';
import {
  type BackendApiHostIsBlockedBySuffixError,
  zBackendApiHostIsBlockedBySuffixError
} from '#common/types/backend/errors/backend-api-host-is-blocked-by-suffix-error';
import {
  type BackendApiInvalidUrlError,
  zBackendApiInvalidUrlError
} from '#common/types/backend/errors/backend-api-invalid-url-error';
import {
  type BackendApiProtocolMustBeHttpsOrHttpError,
  zBackendApiProtocolMustBeHttpsOrHttpError
} from '#common/types/backend/errors/backend-api-protocol-must-be-https-or-http-error';
import {
  type BackendBranchDoesNotExistError,
  zBackendBranchDoesNotExistError
} from '#common/types/backend/errors/backend-branch-does-not-exist-error';
import {
  type BackendBridgeBranchEnvDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError
} from '#common/types/backend/errors/backend-bridge-branch-env-does-not-exist-error';
import {
  type BackendChartCreatorIdMismatchError,
  zBackendChartCreatorIdMismatchError
} from '#common/types/backend/errors/backend-chart-creator-id-mismatch-error';
import {
  type BackendChartDoesNotExistError,
  zBackendChartDoesNotExistError
} from '#common/types/backend/errors/backend-chart-does-not-exist-error';
import {
  type BackendConnectionDoesNotExistError,
  zBackendConnectionDoesNotExistError
} from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import {
  type BackendDashboardCreatorIdMismatchError,
  zBackendDashboardCreatorIdMismatchError
} from '#common/types/backend/errors/backend-dashboard-creator-id-mismatch-error';
import {
  type BackendDashboardDoesNotExistError,
  zBackendDashboardDoesNotExistError
} from '#common/types/backend/errors/backend-dashboard-does-not-exist-error';
import {
  type BackendDatabricksFailedToCloseConnectionError,
  zBackendDatabricksFailedToCloseConnectionError
} from '#common/types/backend/errors/backend-databricks-failed-to-close-connection-error';
import {
  type BackendEnvDoesNotExistError,
  zBackendEnvDoesNotExistError
} from '#common/types/backend/errors/backend-env-does-not-exist-error';
import {
  type BackendForbiddenDashboardError,
  zBackendForbiddenDashboardError
} from '#common/types/backend/errors/backend-forbidden-dashboard-error';
import {
  type BackendForbiddenModelError,
  zBackendForbiddenModelError
} from '#common/types/backend/errors/backend-forbidden-model-error';
import {
  type BackendForbiddenRepoIdError,
  zBackendForbiddenRepoIdError
} from '#common/types/backend/errors/backend-forbidden-repo-id-error';
import {
  type BackendForbiddenReportError,
  zBackendForbiddenReportError
} from '#common/types/backend/errors/backend-forbidden-report-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/types/backend/errors/backend-member-does-not-have-access-to-env-error';
import {
  type BackendModelDoesNotExistError,
  zBackendModelDoesNotExistError
} from '#common/types/backend/errors/backend-model-does-not-exist-error';
import {
  type BackendModelIdIsNotDefinedError,
  zBackendModelIdIsNotDefinedError
} from '#common/types/backend/errors/backend-model-id-is-not-defined-error';
import {
  type BackendMysqlConnectionCloseError,
  zBackendMysqlConnectionCloseError
} from '#common/types/backend/errors/backend-mysql-connection-close-error';
import {
  type BackendProductionRepoNotAllowedError,
  zBackendProductionRepoNotAllowedError
} from '#common/types/backend/errors/backend-production-repo-not-allowed-error';
import {
  type BackendQueriesDoNotExistError,
  zBackendQueriesDoNotExistError
} from '#common/types/backend/errors/backend-queries-do-not-exist-error';
import {
  type BackendQueryDoesNotExistError,
  zBackendQueryDoesNotExistError
} from '#common/types/backend/errors/backend-query-does-not-exist-error';
import {
  type BackendReportCreatorIdMismatchError,
  zBackendReportCreatorIdMismatchError
} from '#common/types/backend/errors/backend-report-creator-id-mismatch-error';
import {
  type BackendReportNotFoundError,
  zBackendReportNotFoundError
} from '#common/types/backend/errors/backend-report-not-found-error';
import {
  type BackendRunQueriesPoolError,
  zBackendRunQueriesPoolError
} from '#common/types/backend/errors/backend-run-queries-pool-error';
import {
  type BackendRunQueryApiError,
  zBackendRunQueryApiError
} from '#common/types/backend/errors/backend-run-query-api-error';
import {
  type BackendRunQueryDatabricksError,
  zBackendRunQueryDatabricksError
} from '#common/types/backend/errors/backend-run-query-databricks-error';
import {
  type BackendRunQueryDuckdbError,
  zBackendRunQueryDuckdbError
} from '#common/types/backend/errors/backend-run-query-duckdb-error';
import {
  type BackendRunQueryMysqlError,
  zBackendRunQueryMysqlError
} from '#common/types/backend/errors/backend-run-query-mysql-error';
import {
  type BackendRunQueryPostgresError,
  zBackendRunQueryPostgresError
} from '#common/types/backend/errors/backend-run-query-postgres-error';
import {
  type BackendRunQueryPrestoError,
  zBackendRunQueryPrestoError
} from '#common/types/backend/errors/backend-run-query-presto-error';
import {
  type BackendRunQuerySnowflakeError,
  zBackendRunQuerySnowflakeError
} from '#common/types/backend/errors/backend-run-query-snowflake-error';
import {
  type BackendRunQueryTrinoError,
  zBackendRunQueryTrinoError
} from '#common/types/backend/errors/backend-run-query-trino-error';
import {
  type BackendSnowflakeFailedToDestroyConnectionError,
  zBackendSnowflakeFailedToDestroyConnectionError
} from '#common/types/backend/errors/backend-snowflake-failed-to-destroy-connection-error';
import {
  type BackendStructDoesNotExistError,
  zBackendStructDoesNotExistError
} from '#common/types/backend/errors/backend-struct-does-not-exist-error';
import {
  type BackendSuggestFieldNotFoundError,
  zBackendSuggestFieldNotFoundError
} from '#common/types/backend/errors/backend-suggest-field-not-found-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';

export type ToBackendRunQueriesError =
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
  | BackendDashboardCreatorIdMismatchError
  | BackendDashboardDoesNotExistError
  | BackendDatabricksFailedToCloseConnectionError
  | BackendEnvDoesNotExistError
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
  | BackendQueriesDoNotExistError
  | BackendQueryDoesNotExistError
  | BackendReportCreatorIdMismatchError
  | BackendReportNotFoundError
  | BackendRunQueriesPoolError
  | BackendRunQueryApiError
  | BackendRunQueryDatabricksError
  | BackendRunQueryDuckdbError
  | BackendRunQueryMysqlError
  | BackendRunQueryPostgresError
  | BackendRunQueryPrestoError
  | BackendRunQuerySnowflakeError
  | BackendRunQueryTrinoError
  | BackendSnowflakeFailedToDestroyConnectionError
  | BackendStructDoesNotExistError
  | BackendSuggestFieldNotFoundError
  | BackendTransactionRetryError;

export let zToBackendRunQueriesError = z.discriminatedUnion('code', [
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
  zBackendDashboardCreatorIdMismatchError,
  zBackendDashboardDoesNotExistError,
  zBackendDatabricksFailedToCloseConnectionError,
  zBackendEnvDoesNotExistError,
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
  zBackendQueriesDoNotExistError,
  zBackendQueryDoesNotExistError,
  zBackendReportCreatorIdMismatchError,
  zBackendReportNotFoundError,
  zBackendRunQueriesPoolError,
  zBackendRunQueryApiError,
  zBackendRunQueryDatabricksError,
  zBackendRunQueryDuckdbError,
  zBackendRunQueryMysqlError,
  zBackendRunQueryPostgresError,
  zBackendRunQueryPrestoError,
  zBackendRunQuerySnowflakeError,
  zBackendRunQueryTrinoError,
  zBackendSnowflakeFailedToDestroyConnectionError,
  zBackendStructDoesNotExistError,
  zBackendSuggestFieldNotFoundError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendRunQueriesError,
  z.infer<typeof zToBackendRunQueriesError>
>({ value: true });
