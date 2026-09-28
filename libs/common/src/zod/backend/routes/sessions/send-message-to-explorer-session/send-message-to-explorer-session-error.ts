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
  type BackendCodexAuthSignInRequiredError,
  zBackendCodexAuthSignInRequiredError
} from '#common/zod/backend/errors/backend-codex-auth-sign-in-required-error';
import {
  type BackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsMissingError
} from '#common/zod/backend/errors/backend-codex-auth-token-expires-in-is-missing-error';
import {
  type BackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendCodexAuthTokenExpiresInIsTooShortError
} from '#common/zod/backend/errors/backend-codex-auth-token-expires-in-is-too-short-error';
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
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/zod/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendExplorerContextLimitReachedError,
  zBackendExplorerContextLimitReachedError
} from '#common/zod/backend/errors/backend-explorer-context-limit-reached-error';
import {
  type BackendFetchConstraintsBigqueryError,
  zBackendFetchConstraintsBigqueryError
} from '#common/zod/backend/errors/backend-fetch-constraints-bigquery-error';
import {
  type BackendFetchConstraintsDatabricksError,
  zBackendFetchConstraintsDatabricksError
} from '#common/zod/backend/errors/backend-fetch-constraints-databricks-error';
import {
  type BackendFetchConstraintsDuckdbError,
  zBackendFetchConstraintsDuckdbError
} from '#common/zod/backend/errors/backend-fetch-constraints-duckdb-error';
import {
  type BackendFetchConstraintsSnowflakeError,
  zBackendFetchConstraintsSnowflakeError
} from '#common/zod/backend/errors/backend-fetch-constraints-snowflake-error';
import {
  type BackendFetchDatasetBigqueryError,
  zBackendFetchDatasetBigqueryError
} from '#common/zod/backend/errors/backend-fetch-dataset-bigquery-error';
import {
  type BackendFetchFkBigqueryError,
  zBackendFetchFkBigqueryError
} from '#common/zod/backend/errors/backend-fetch-fk-bigquery-error';
import {
  type BackendFetchFkDatabricksError,
  zBackendFetchFkDatabricksError
} from '#common/zod/backend/errors/backend-fetch-fk-databricks-error';
import {
  type BackendFetchFkDuckdbError,
  zBackendFetchFkDuckdbError
} from '#common/zod/backend/errors/backend-fetch-fk-duckdb-error';
import {
  type BackendFetchFkMysqlError,
  zBackendFetchFkMysqlError
} from '#common/zod/backend/errors/backend-fetch-fk-mysql-error';
import {
  type BackendFetchFkPostgresError,
  zBackendFetchFkPostgresError
} from '#common/zod/backend/errors/backend-fetch-fk-postgres-error';
import {
  type BackendFetchFkSnowflakeError,
  zBackendFetchFkSnowflakeError
} from '#common/zod/backend/errors/backend-fetch-fk-snowflake-error';
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
  type BackendGetProviderModelFailedError,
  zBackendGetProviderModelFailedError
} from '#common/zod/backend/errors/backend-get-provider-model-failed-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendInteractFailedError,
  zBackendInteractFailedError
} from '#common/zod/backend/errors/backend-interact-failed-error';
import {
  type BackendInteractTimeoutError,
  zBackendInteractTimeoutError
} from '#common/zod/backend/errors/backend-interact-timeout-error';
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
  type BackendMessageModelRequiredError,
  zBackendMessageModelRequiredError
} from '#common/zod/backend/errors/backend-message-model-required-error';
import {
  type BackendMessageProviderRequiredError,
  zBackendMessageProviderRequiredError
} from '#common/zod/backend/errors/backend-message-provider-required-error';
import {
  type BackendMessageVariantRequiredError,
  zBackendMessageVariantRequiredError
} from '#common/zod/backend/errors/backend-message-variant-required-error';
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
  type BackendPromptFailedError,
  zBackendPromptFailedError
} from '#common/zod/backend/errors/backend-prompt-failed-error';
import {
  type BackendProviderApiKeyRequiredError,
  zBackendProviderApiKeyRequiredError
} from '#common/zod/backend/errors/backend-provider-api-key-required-error';
import {
  type BackendProviderDoesNotExistError,
  zBackendProviderDoesNotExistError
} from '#common/zod/backend/errors/backend-provider-does-not-exist-error';
import {
  type BackendProviderIsDisabledError,
  zBackendProviderIsDisabledError
} from '#common/zod/backend/errors/backend-provider-is-disabled-error';
import {
  type BackendProviderModelDoesNotExistError,
  zBackendProviderModelDoesNotExistError
} from '#common/zod/backend/errors/backend-provider-model-does-not-exist-error';
import {
  type BackendProviderModelNotAvailableInBuilderError,
  zBackendProviderModelNotAvailableInBuilderError
} from '#common/zod/backend/errors/backend-provider-model-not-available-in-builder-error';
import {
  type BackendProviderModelNotAvailableInExplorerError,
  zBackendProviderModelNotAvailableInExplorerError
} from '#common/zod/backend/errors/backend-provider-model-not-available-in-explorer-error';
import {
  type BackendProviderModelVariantNotAvailableError,
  zBackendProviderModelVariantNotAvailableError
} from '#common/zod/backend/errors/backend-provider-model-variant-not-available-error';
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
  type BackendSessionIsArchivedError,
  zBackendSessionIsArchivedError
} from '#common/zod/backend/errors/backend-session-is-archived-error';
import {
  type BackendSessionIsInErrorStateError,
  zBackendSessionIsInErrorStateError
} from '#common/zod/backend/errors/backend-session-is-in-error-state-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/zod/backend/errors/backend-session-not-found-error';
import {
  type BackendSessionNotReadyError,
  zBackendSessionNotReadyError
} from '#common/zod/backend/errors/backend-session-not-ready-error';
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
import {
  type BackendUserProfileCodexAuthNotSetError,
  zBackendUserProfileCodexAuthNotSetError
} from '#common/zod/backend/errors/backend-user-profile-codex-auth-not-set-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendSendMessageToExplorerSessionError =
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
  | BackendExplorerContextLimitReachedError
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
  | BackendInteractFailedError
  | BackendInteractTimeoutError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendMemberIsNotEditorOrAdminError
  | BackendMessageModelRequiredError
  | BackendMessageProviderRequiredError
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
  | BackendSessionIsArchivedError
  | BackendSessionIsInErrorStateError
  | BackendSessionNotFoundError
  | BackendSessionNotReadyError
  | BackendSessionTypeIsNotExplorerError
  | BackendSnowflakeFailedToDestroyConnectionError
  | BackendStructDoesNotExistError
  | BackendSuggestFieldNotFoundError
  | BackendTransactionRetryError
  | BackendUserProfileCodexAuthNotSetError
  | BackendWrongTotalDiskShardsError;

export let zToBackendSendMessageToExplorerSessionError = z.discriminatedUnion(
  'code',
  [
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
    zBackendExplorerContextLimitReachedError,
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
    zBackendInteractFailedError,
    zBackendInteractTimeoutError,
    zBackendMemberDoesNotExistError,
    zBackendMemberDoesNotHaveAccessToEnvError,
    zBackendMemberIsNotEditorOrAdminError,
    zBackendMessageModelRequiredError,
    zBackendMessageProviderRequiredError,
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
    zBackendSessionIsArchivedError,
    zBackendSessionIsInErrorStateError,
    zBackendSessionNotFoundError,
    zBackendSessionNotReadyError,
    zBackendSessionTypeIsNotExplorerError,
    zBackendSnowflakeFailedToDestroyConnectionError,
    zBackendStructDoesNotExistError,
    zBackendSuggestFieldNotFoundError,
    zBackendTransactionRetryError,
    zBackendUserProfileCodexAuthNotSetError,
    zBackendWrongTotalDiskShardsError
  ]
);

assertTypesEqual<
  ToBackendSendMessageToExplorerSessionError,
  z.infer<typeof zToBackendSendMessageToExplorerSessionError>
>({ value: true });
