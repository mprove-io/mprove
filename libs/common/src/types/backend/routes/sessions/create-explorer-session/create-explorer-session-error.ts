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
  type BackendCodexAuthSignInRequiredError,
  zBackendCodexAuthSignInRequiredError
} from '#common/types/backend/errors/backend-codex-auth-sign-in-required-error';
import {
  type BackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsMissingError
} from '#common/types/backend/errors/backend-codex-auth-token-expires-in-is-missing-error';
import {
  type BackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendCodexAuthTokenExpiresInIsTooShortError
} from '#common/types/backend/errors/backend-codex-auth-token-expires-in-is-too-short-error';
import {
  type BackendConnectionDoesNotExistError,
  zBackendConnectionDoesNotExistError
} from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import {
  type BackendCreateChartFailError,
  zBackendCreateChartFailError
} from '#common/types/backend/errors/backend-create-chart-fail-error';
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
  type BackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromBlockmlError
} from '#common/types/backend/errors/backend-error-response-from-blockml-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/types/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendFetchConstraintsBigqueryError,
  zBackendFetchConstraintsBigqueryError
} from '#common/types/backend/errors/backend-fetch-constraints-bigquery-error';
import {
  type BackendFetchConstraintsDatabricksError,
  zBackendFetchConstraintsDatabricksError
} from '#common/types/backend/errors/backend-fetch-constraints-databricks-error';
import {
  type BackendFetchConstraintsDuckdbError,
  zBackendFetchConstraintsDuckdbError
} from '#common/types/backend/errors/backend-fetch-constraints-duckdb-error';
import {
  type BackendFetchConstraintsSnowflakeError,
  zBackendFetchConstraintsSnowflakeError
} from '#common/types/backend/errors/backend-fetch-constraints-snowflake-error';
import {
  type BackendFetchDatasetBigqueryError,
  zBackendFetchDatasetBigqueryError
} from '#common/types/backend/errors/backend-fetch-dataset-bigquery-error';
import {
  type BackendFetchFkBigqueryError,
  zBackendFetchFkBigqueryError
} from '#common/types/backend/errors/backend-fetch-fk-bigquery-error';
import {
  type BackendFetchFkDatabricksError,
  zBackendFetchFkDatabricksError
} from '#common/types/backend/errors/backend-fetch-fk-databricks-error';
import {
  type BackendFetchFkDuckdbError,
  zBackendFetchFkDuckdbError
} from '#common/types/backend/errors/backend-fetch-fk-duckdb-error';
import {
  type BackendFetchFkMysqlError,
  zBackendFetchFkMysqlError
} from '#common/types/backend/errors/backend-fetch-fk-mysql-error';
import {
  type BackendFetchFkPostgresError,
  zBackendFetchFkPostgresError
} from '#common/types/backend/errors/backend-fetch-fk-postgres-error';
import {
  type BackendFetchFkSnowflakeError,
  zBackendFetchFkSnowflakeError
} from '#common/types/backend/errors/backend-fetch-fk-snowflake-error';
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
  type BackendGetProviderModelFailedError,
  zBackendGetProviderModelFailedError
} from '#common/types/backend/errors/backend-get-provider-model-failed-error';
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
  type BackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotEditorOrAdminError
} from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import {
  type BackendMemberIsNotExplorerError,
  zBackendMemberIsNotExplorerError
} from '#common/types/backend/errors/backend-member-is-not-explorer-error';
import {
  type BackendMessageVariantRequiredError,
  zBackendMessageVariantRequiredError
} from '#common/types/backend/errors/backend-message-variant-required-error';
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
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendPromptFailedError,
  zBackendPromptFailedError
} from '#common/types/backend/errors/backend-prompt-failed-error';
import {
  type BackendProviderApiKeyRequiredError,
  zBackendProviderApiKeyRequiredError
} from '#common/types/backend/errors/backend-provider-api-key-required-error';
import {
  type BackendProviderDoesNotExistError,
  zBackendProviderDoesNotExistError
} from '#common/types/backend/errors/backend-provider-does-not-exist-error';
import {
  type BackendProviderIsDisabledError,
  zBackendProviderIsDisabledError
} from '#common/types/backend/errors/backend-provider-is-disabled-error';
import {
  type BackendProviderModelDoesNotExistError,
  zBackendProviderModelDoesNotExistError
} from '#common/types/backend/errors/backend-provider-model-does-not-exist-error';
import {
  type BackendProviderModelNotAvailableInBuilderError,
  zBackendProviderModelNotAvailableInBuilderError
} from '#common/types/backend/errors/backend-provider-model-not-available-in-builder-error';
import {
  type BackendProviderModelNotAvailableInExplorerError,
  zBackendProviderModelNotAvailableInExplorerError
} from '#common/types/backend/errors/backend-provider-model-not-available-in-explorer-error';
import {
  type BackendProviderModelVariantNotAvailableError,
  zBackendProviderModelVariantNotAvailableError
} from '#common/types/backend/errors/backend-provider-model-variant-not-available-error';
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
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/types/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/types/backend/errors/backend-rpc-timeout-error';
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
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/types/backend/errors/backend-session-not-found-error';
import {
  type BackendSessionTypeIsNotExplorerError,
  zBackendSessionTypeIsNotExplorerError
} from '#common/types/backend/errors/backend-session-type-is-not-explorer-error';
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
import {
  type BackendUserProfileCodexAuthNotSetError,
  zBackendUserProfileCodexAuthNotSetError
} from '#common/types/backend/errors/backend-user-profile-codex-auth-not-set-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/types/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendCreateExplorerSessionError =
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
  | BackendCodexAuthSignInRequiredError
  | BackendCodexAuthTokenExpiresInIsMissingError
  | BackendCodexAuthTokenExpiresInIsTooShortError
  | BackendConnectionDoesNotExistError
  | BackendCreateChartFailError
  | BackendDashboardCreatorIdMismatchError
  | BackendDashboardDoesNotExistError
  | BackendDatabricksFailedToCloseConnectionError
  | BackendEnvDoesNotExistError
  | BackendErrorResponseFromBlockmlError
  | BackendErrorResponseFromDiskError
  | BackendFetchConstraintsBigqueryError
  | BackendFetchConstraintsDatabricksError
  | BackendFetchConstraintsDuckdbError
  | BackendFetchConstraintsSnowflakeError
  | BackendFetchDatasetBigqueryError
  | BackendFetchFkBigqueryError
  | BackendFetchFkDatabricksError
  | BackendFetchFkDuckdbError
  | BackendFetchFkMysqlError
  | BackendFetchFkPostgresError
  | BackendFetchFkSnowflakeError
  | BackendForbiddenDashboardError
  | BackendForbiddenModelError
  | BackendForbiddenReportError
  | BackendForbiddenRepoIdError
  | BackendGetProviderModelFailedError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendMemberIsNotEditorOrAdminError
  | BackendMemberIsNotExplorerError
  | BackendMessageVariantRequiredError
  | BackendModelDoesNotExistError
  | BackendModelIdIsNotDefinedError
  | BackendMysqlConnectionCloseError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError
  | BackendPromptFailedError
  | BackendProviderApiKeyRequiredError
  | BackendProviderDoesNotExistError
  | BackendProviderIsDisabledError
  | BackendProviderModelDoesNotExistError
  | BackendProviderModelNotAvailableInBuilderError
  | BackendProviderModelNotAvailableInExplorerError
  | BackendProviderModelVariantNotAvailableError
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
  | BackendTransactionRetryError
  | BackendUserProfileCodexAuthNotSetError
  | BackendWrongTotalDiskShardsError;

export let zToBackendCreateExplorerSessionError = z.discriminatedUnion('code', [
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
  zBackendCodexAuthSignInRequiredError,
  zBackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendConnectionDoesNotExistError,
  zBackendCreateChartFailError,
  zBackendDashboardCreatorIdMismatchError,
  zBackendDashboardDoesNotExistError,
  zBackendDatabricksFailedToCloseConnectionError,
  zBackendEnvDoesNotExistError,
  zBackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromDiskError,
  zBackendFetchConstraintsBigqueryError,
  zBackendFetchConstraintsDatabricksError,
  zBackendFetchConstraintsDuckdbError,
  zBackendFetchConstraintsSnowflakeError,
  zBackendFetchDatasetBigqueryError,
  zBackendFetchFkBigqueryError,
  zBackendFetchFkDatabricksError,
  zBackendFetchFkDuckdbError,
  zBackendFetchFkMysqlError,
  zBackendFetchFkPostgresError,
  zBackendFetchFkSnowflakeError,
  zBackendForbiddenDashboardError,
  zBackendForbiddenModelError,
  zBackendForbiddenReportError,
  zBackendForbiddenRepoIdError,
  zBackendGetProviderModelFailedError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotExplorerError,
  zBackendMessageVariantRequiredError,
  zBackendModelDoesNotExistError,
  zBackendModelIdIsNotDefinedError,
  zBackendMysqlConnectionCloseError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError,
  zBackendPromptFailedError,
  zBackendProviderApiKeyRequiredError,
  zBackendProviderDoesNotExistError,
  zBackendProviderIsDisabledError,
  zBackendProviderModelDoesNotExistError,
  zBackendProviderModelNotAvailableInBuilderError,
  zBackendProviderModelNotAvailableInExplorerError,
  zBackendProviderModelVariantNotAvailableError,
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
  zBackendTransactionRetryError,
  zBackendUserProfileCodexAuthNotSetError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendCreateExplorerSessionError,
  z.infer<typeof zToBackendCreateExplorerSessionError>
>({ value: true });
