import type { BackendAdminCannotChangeHisAdminStatusError } from '#common/types/backend/errors/backend-admin-cannot-change-his-admin-status-error';
import type { BackendAdminCannotDeleteHimselfError } from '#common/types/backend/errors/backend-admin-cannot-delete-himself-error';
import type { BackendApiHostDnsLookupFailedError } from '#common/types/backend/errors/backend-api-host-dns-lookup-failed-error';
import type { BackendApiHostIsBlockedByIpError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-ip-error';
import type { BackendApiHostIsBlockedByListError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-list-error';
import type { BackendApiHostIsBlockedBySpecError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-spec-error';
import type { BackendApiHostIsBlockedBySuffixError } from '#common/types/backend/errors/backend-api-host-is-blocked-by-suffix-error';
import type { BackendApiInvalidUrlError } from '#common/types/backend/errors/backend-api-invalid-url-error';
import type { BackendApiKeyNotFoundError } from '#common/types/backend/errors/backend-api-key-not-found-error';
import type { BackendApiKeyNotValidError } from '#common/types/backend/errors/backend-api-key-not-valid-error';
import type { BackendApiProtocolMustBeHttpsOrHttpError } from '#common/types/backend/errors/backend-api-protocol-must-be-https-or-http-error';
import type { BackendBigqueryCancelQueryJobFailError } from '#common/types/backend/errors/backend-bigquery-cancel-query-job-fail-error';
import type { BackendBranchAlreadyExistsError } from '#common/types/backend/errors/backend-branch-already-exists-error';
import type { BackendBranchDoesNotExistError } from '#common/types/backend/errors/backend-branch-does-not-exist-error';
import type { BackendBranchIdDoesNotMatchSessionError } from '#common/types/backend/errors/backend-branch-id-does-not-match-session-error';
import type { BackendBridgeBranchEnvDoesNotExistError } from '#common/types/backend/errors/backend-bridge-branch-env-does-not-exist-error';
import type { BackendChartCreatorIdMismatchError } from '#common/types/backend/errors/backend-chart-creator-id-mismatch-error';
import type { BackendChartDoesNotExistError } from '#common/types/backend/errors/backend-chart-does-not-exist-error';
import type { BackendChartIsNotDraftError } from '#common/types/backend/errors/backend-chart-is-not-draft-error';
import type { BackendChartNotFoundError } from '#common/types/backend/errors/backend-chart-not-found-error';
import type { BackendCodexAuthSignInRequiredError } from '#common/types/backend/errors/backend-codex-auth-sign-in-required-error';
import type { BackendCodexAuthTokenExpiresInIsMissingError } from '#common/types/backend/errors/backend-codex-auth-token-expires-in-is-missing-error';
import type { BackendCodexAuthTokenExpiresInIsTooShortError } from '#common/types/backend/errors/backend-codex-auth-token-expires-in-is-too-short-error';
import type { BackendCodexDeviceAuthStartFailedError } from '#common/types/backend/errors/backend-codex-device-auth-start-failed-error';
import type { BackendConnectionAlreadyExistsError } from '#common/types/backend/errors/backend-connection-already-exists-error';
import type { BackendConnectionDoesNotExistError } from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import type { BackendConnectionSchemaIsNotFoundError } from '#common/types/backend/errors/backend-connection-schema-is-not-found-error';
import type { BackendConnectionTypeIsNotSupportedForSampleError } from '#common/types/backend/errors/backend-connection-type-is-not-supported-for-sample-error';
import type { BackendCreateChartFailError } from '#common/types/backend/errors/backend-create-chart-fail-error';
import type { BackendCreateDashboardFailError } from '#common/types/backend/errors/backend-create-dashboard-fail-error';
import type { BackendCreateDraftDashboardFailedError } from '#common/types/backend/errors/backend-create-draft-dashboard-failed-error';
import type { BackendCreateReportFailError } from '#common/types/backend/errors/backend-create-report-fail-error';
import type { BackendCreateSessionFailedError } from '#common/types/backend/errors/backend-create-session-failed-error';
import type { BackendCreationOfOrganizationsIsForbiddenError } from '#common/types/backend/errors/backend-creation-of-organizations-is-forbidden-error';
import type { BackendDashboardCreatorIdMismatchError } from '#common/types/backend/errors/backend-dashboard-creator-id-mismatch-error';
import type { BackendDashboardDoesNotExistError } from '#common/types/backend/errors/backend-dashboard-does-not-exist-error';
import type { BackendDashboardIdChartIdAndReportIdAreNotDefinedError } from '#common/types/backend/errors/backend-dashboard-id-chart-id-and-report-id-are-not-defined-error';
import type { BackendDashboardNotFoundError } from '#common/types/backend/errors/backend-dashboard-not-found-error';
import type { BackendDatabricksFailedToCloseConnectionError } from '#common/types/backend/errors/backend-databricks-failed-to-close-connection-error';
import type { BackendDateConversionFailedError } from '#common/types/backend/errors/backend-date-conversion-failed-error';
import type { BackendDbRecordHasBothDecryptedAndEncryptedPropsError } from '#common/types/backend/errors/backend-db-record-has-both-decrypted-and-encrypted-props-error';
import type { BackendDbRecordHasNoDecryptedAndNoEncryptedPropsError } from '#common/types/backend/errors/backend-db-record-has-no-decrypted-and-no-encrypted-props-error';
import type { BackendDbRecordIsDecryptedButHasKeyTagError } from '#common/types/backend/errors/backend-db-record-is-decrypted-but-has-key-tag-error';
import type { BackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError } from '#common/types/backend/errors/backend-db-record-key-tag-does-not-match-current-or-prev-error';
import type { BackendDefaultBranchCannotBeDeletedError } from '#common/types/backend/errors/backend-default-branch-cannot-be-deleted-error';
import type { BackendEditDraftDashboardFailedError } from '#common/types/backend/errors/backend-edit-draft-dashboard-failed-error';
import type { BackendEditorSessionLockFailedError } from '#common/types/backend/errors/backend-editor-session-lock-failed-error';
import type { BackendEnvAlreadyExistsError } from '#common/types/backend/errors/backend-env-already-exists-error';
import type { BackendEnvDoesNotExistError } from '#common/types/backend/errors/backend-env-does-not-exist-error';
import type { BackendEnvIdDoesNotMatchSessionError } from '#common/types/backend/errors/backend-env-id-does-not-match-session-error';
import type { BackendEnvProdCannotBeDeletedError } from '#common/types/backend/errors/backend-env-prod-cannot-be-deleted-error';
import type { BackendEnvUserAlreadyExistsError } from '#common/types/backend/errors/backend-env-user-already-exists-error';
import type { BackendErrorResponseFromBlockmlError } from '#common/types/backend/errors/backend-error-response-from-blockml-error';
import type { BackendErrorResponseFromDiskError } from '#common/types/backend/errors/backend-error-response-from-disk-error';
import type { BackendEvAlreadyExistsError } from '#common/types/backend/errors/backend-ev-already-exists-error';
import type { BackendEvDoesNotExistError } from '#common/types/backend/errors/backend-ev-does-not-exist-error';
import type { BackendExplorerContextLimitReachedError } from '#common/types/backend/errors/backend-explorer-context-limit-reached-error';
import type { BackendFailedToGetInitialCommitError } from '#common/types/backend/errors/backend-failed-to-get-initial-commit-error';
import type { BackendFetchConstraintsBigqueryError } from '#common/types/backend/errors/backend-fetch-constraints-bigquery-error';
import type { BackendFetchConstraintsDatabricksError } from '#common/types/backend/errors/backend-fetch-constraints-databricks-error';
import type { BackendFetchConstraintsDuckdbError } from '#common/types/backend/errors/backend-fetch-constraints-duckdb-error';
import type { BackendFetchConstraintsSnowflakeError } from '#common/types/backend/errors/backend-fetch-constraints-snowflake-error';
import type { BackendFetchDatasetBigqueryError } from '#common/types/backend/errors/backend-fetch-dataset-bigquery-error';
import type { BackendFetchFailedError } from '#common/types/backend/errors/backend-fetch-failed-error';
import type { BackendFetchFkBigqueryError } from '#common/types/backend/errors/backend-fetch-fk-bigquery-error';
import type { BackendFetchFkDatabricksError } from '#common/types/backend/errors/backend-fetch-fk-databricks-error';
import type { BackendFetchFkDuckdbError } from '#common/types/backend/errors/backend-fetch-fk-duckdb-error';
import type { BackendFetchFkMysqlError } from '#common/types/backend/errors/backend-fetch-fk-mysql-error';
import type { BackendFetchFkPostgresError } from '#common/types/backend/errors/backend-fetch-fk-postgres-error';
import type { BackendFetchFkSnowflakeError } from '#common/types/backend/errors/backend-fetch-fk-snowflake-error';
import type { BackendFetchTimeoutError } from '#common/types/backend/errors/backend-fetch-timeout-error';
import type { BackendForbiddenChartPathError } from '#common/types/backend/errors/backend-forbidden-chart-path-error';
import type { BackendForbiddenDashboardError } from '#common/types/backend/errors/backend-forbidden-dashboard-error';
import type { BackendForbiddenModelError } from '#common/types/backend/errors/backend-forbidden-model-error';
import type { BackendForbiddenOrgError } from '#common/types/backend/errors/backend-forbidden-org-error';
import type { BackendForbiddenRepoIdError } from '#common/types/backend/errors/backend-forbidden-repo-id-error';
import type { BackendForbiddenReportError } from '#common/types/backend/errors/backend-forbidden-report-error';
import type { BackendGetDashboardFailError } from '#common/types/backend/errors/backend-get-dashboard-fail-error';
import type { BackendGetIdempRespRetryError } from '#common/types/backend/errors/backend-get-idemp-resp-retry-error';
import type { BackendGetIdempRespRetryFailedError } from '#common/types/backend/errors/backend-get-idemp-resp-retry-failed-error';
import type { BackendGetProviderModelFailedError } from '#common/types/backend/errors/backend-get-provider-model-failed-error';
import type { BackendGivenAlreadyExistsError } from '#common/types/backend/errors/backend-given-already-exists-error';
import type { BackendGivenDoesNotExistError } from '#common/types/backend/errors/backend-given-does-not-exist-error';
import type { BackendHashSecretIsNotDefinedError } from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import type { BackendIdempUserMismatchError } from '#common/types/backend/errors/backend-idemp-user-mismatch-error';
import type { BackendInteractFailedError } from '#common/types/backend/errors/backend-interact-failed-error';
import type { BackendInteractTimeoutError } from '#common/types/backend/errors/backend-interact-timeout-error';
import type { BackendInternalError } from '#common/types/backend/errors/backend-internal-error';
import type { BackendInvalidRequestError } from '#common/types/backend/errors/backend-invalid-request-error';
import type { BackendLlmModelAlreadyExistsError } from '#common/types/backend/errors/backend-llm-model-already-exists-error';
import type { BackendLlmModelContextLimitRequiredError } from '#common/types/backend/errors/backend-llm-model-context-limit-required-error';
import type { BackendLlmModelDiscoveryFailedError } from '#common/types/backend/errors/backend-llm-model-discovery-failed-error';
import type { BackendLlmModelDoesNotExistError } from '#common/types/backend/errors/backend-llm-model-does-not-exist-error';
import type { BackendLlmModelLimitInvalidError } from '#common/types/backend/errors/backend-llm-model-limit-invalid-error';
import type { BackendLlmModelNotAvailableInBuilderError } from '#common/types/backend/errors/backend-llm-model-not-available-in-builder-error';
import type { BackendLlmModelNotAvailableInExplorerError } from '#common/types/backend/errors/backend-llm-model-not-available-in-explorer-error';
import type { BackendLlmModelNotDiscoveredError } from '#common/types/backend/errors/backend-llm-model-not-discovered-error';
import type { BackendLlmModelVariantNotAvailableError } from '#common/types/backend/errors/backend-llm-model-variant-not-available-error';
import type { BackendLlmModelVariantsInvalidError } from '#common/types/backend/errors/backend-llm-model-variants-invalid-error';
import type { BackendMalloyConnectionCloseError } from '#common/types/backend/errors/backend-malloy-connection-close-error';
import type { BackendManualCommitToProductionRepoIsForbiddenError } from '#common/types/backend/errors/backend-manual-commit-to-production-repo-is-forbidden-error';
import type { BackendMconfigDoesNotExistError } from '#common/types/backend/errors/backend-mconfig-does-not-exist-error';
import type { BackendMconfigParentIdMismatchError } from '#common/types/backend/errors/backend-mconfig-parent-id-mismatch-error';
import type { BackendMconfigQueryIdMismatchError } from '#common/types/backend/errors/backend-mconfig-query-id-mismatch-error';
import type { BackendMemberAlreadyExistsError } from '#common/types/backend/errors/backend-member-already-exists-error';
import type { BackendMemberDoesNotExistError } from '#common/types/backend/errors/backend-member-does-not-exist-error';
import type { BackendMemberDoesNotHaveAccessToEnvError } from '#common/types/backend/errors/backend-member-does-not-have-access-to-env-error';
import type { BackendMemberIsNotAdminError } from '#common/types/backend/errors/backend-member-is-not-admin-error';
import type { BackendMemberIsNotEditorError } from '#common/types/backend/errors/backend-member-is-not-editor-error';
import type { BackendMemberIsNotEditorOrAdminError } from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import type { BackendMemberIsNotExplorerError } from '#common/types/backend/errors/backend-member-is-not-explorer-error';
import type { BackendMessageAgentRequiredError } from '#common/types/backend/errors/backend-message-agent-required-error';
import type { BackendMessageModelRequiredError } from '#common/types/backend/errors/backend-message-model-required-error';
import type { BackendMessageProviderRequiredError } from '#common/types/backend/errors/backend-message-provider-required-error';
import type { BackendMessageVariantRequiredError } from '#common/types/backend/errors/backend-message-variant-required-error';
import type { BackendModelDoesNotExistError } from '#common/types/backend/errors/backend-model-does-not-exist-error';
import type { BackendModelIdIsNotDefinedError } from '#common/types/backend/errors/backend-model-id-is-not-defined-error';
import type { BackendModifyChartFailError } from '#common/types/backend/errors/backend-modify-chart-fail-error';
import type { BackendModifyDashboardFailError } from '#common/types/backend/errors/backend-modify-dashboard-fail-error';
import type { BackendModifyReportFailError } from '#common/types/backend/errors/backend-modify-report-fail-error';
import type { BackendMutuallyExclusiveParamsError } from '#common/types/backend/errors/backend-mutually-exclusive-params-error';
import type { BackendMysqlConnectionCloseError } from '#common/types/backend/errors/backend-mysql-connection-close-error';
import type { BackendNewOwnerNotFoundError } from '#common/types/backend/errors/backend-new-owner-not-found-error';
import type { BackendNotAuthorizedError } from '#common/types/backend/errors/backend-not-authorized-error';
import type { BackendNoteDoesNotExistError } from '#common/types/backend/errors/backend-note-does-not-exist-error';
import type { BackendOnlyOrgOwnerCanAccessError } from '#common/types/backend/errors/backend-only-org-owner-can-access-error';
import type { BackendOrgAlreadyExistsError } from '#common/types/backend/errors/backend-org-already-exists-error';
import type { BackendOrgDoesNotExistError } from '#common/types/backend/errors/backend-org-does-not-exist-error';
import type { BackendProductionRepoNotAllowedError } from '#common/types/backend/errors/backend-production-repo-not-allowed-error';
import type { BackendProjectAlreadyExistsError } from '#common/types/backend/errors/backend-project-already-exists-error';
import type { BackendProjectDoesNotExistError } from '#common/types/backend/errors/backend-project-does-not-exist-error';
import type { BackendPromptFailedError } from '#common/types/backend/errors/backend-prompt-failed-error';
import type { BackendProviderAlreadyExistsError } from '#common/types/backend/errors/backend-provider-already-exists-error';
import type { BackendProviderApiKeyRequiredError } from '#common/types/backend/errors/backend-provider-api-key-required-error';
import type { BackendProviderDoesNotExistError } from '#common/types/backend/errors/backend-provider-does-not-exist-error';
import type { BackendProviderIsDisabledError } from '#common/types/backend/errors/backend-provider-is-disabled-error';
import type { BackendProviderNotValidApiKeyError } from '#common/types/backend/errors/backend-provider-not-valid-api-key-error';
import type { BackendProviderTypeMismatchError } from '#common/types/backend/errors/backend-provider-type-mismatch-error';
import type { BackendQueriesDoNotExistError } from '#common/types/backend/errors/backend-queries-do-not-exist-error';
import type { BackendQueryDoesNotExistError } from '#common/types/backend/errors/backend-query-does-not-exist-error';
import type { BackendRefetchFromOpencodeFailedError } from '#common/types/backend/errors/backend-refetch-from-opencode-failed-error';
import type { BackendRepoIdDoesNotMatchSessionError } from '#common/types/backend/errors/backend-repo-id-does-not-match-session-error';
import type { BackendRepoIdDoesNotMatchUserError } from '#common/types/backend/errors/backend-repo-id-does-not-match-user-error';
import type { BackendReportCreatorIdMismatchError } from '#common/types/backend/errors/backend-report-creator-id-mismatch-error';
import type { BackendReportNotFoundError } from '#common/types/backend/errors/backend-report-not-found-error';
import type { BackendRestrictedOrganizationError } from '#common/types/backend/errors/backend-restricted-organization-error';
import type { BackendRestrictedOrganizationNameError } from '#common/types/backend/errors/backend-restricted-organization-name-error';
import type { BackendRestrictedProjectError } from '#common/types/backend/errors/backend-restricted-project-error';
import type { BackendRestrictedUserError } from '#common/types/backend/errors/backend-restricted-user-error';
import type { BackendRoleAlreadyExistsError } from '#common/types/backend/errors/backend-role-already-exists-error';
import type { BackendRoleDoesNotExistError } from '#common/types/backend/errors/backend-role-does-not-exist-error';
import type { BackendRoleGivenAlreadyExistsError } from '#common/types/backend/errors/backend-role-given-already-exists-error';
import type { BackendRoleGivenDoesNotExistError } from '#common/types/backend/errors/backend-role-given-does-not-exist-error';
import type { BackendRolesDoNotExistError } from '#common/types/backend/errors/backend-roles-do-not-exist-error';
import type { BackendRowIdDoesNotWorkWithoutReportIdError } from '#common/types/backend/errors/backend-row-id-does-not-work-without-report-id-error';
import type { BackendRpcInvalidResponseFormatError } from '#common/types/backend/errors/backend-rpc-invalid-response-format-error';
import type { BackendRpcTimeoutError } from '#common/types/backend/errors/backend-rpc-timeout-error';
import type { BackendRunQueriesPoolError } from '#common/types/backend/errors/backend-run-queries-pool-error';
import type { BackendRunQueryApiError } from '#common/types/backend/errors/backend-run-query-api-error';
import type { BackendRunQueryDatabricksError } from '#common/types/backend/errors/backend-run-query-databricks-error';
import type { BackendRunQueryDuckdbError } from '#common/types/backend/errors/backend-run-query-duckdb-error';
import type { BackendRunQueryMysqlError } from '#common/types/backend/errors/backend-run-query-mysql-error';
import type { BackendRunQueryPostgresError } from '#common/types/backend/errors/backend-run-query-postgres-error';
import type { BackendRunQueryPrestoError } from '#common/types/backend/errors/backend-run-query-presto-error';
import type { BackendRunQuerySnowflakeError } from '#common/types/backend/errors/backend-run-query-snowflake-error';
import type { BackendRunQueryTrinoError } from '#common/types/backend/errors/backend-run-query-trino-error';
import type { BackendSandboxCreateFailedError } from '#common/types/backend/errors/backend-sandbox-create-failed-error';
import type { BackendSandboxGitCheckoutFailedError } from '#common/types/backend/errors/backend-sandbox-git-checkout-failed-error';
import type { BackendSandboxGitCloneFailedError } from '#common/types/backend/errors/backend-sandbox-git-clone-failed-error';
import type { BackendSandboxHealthCheckFailedError } from '#common/types/backend/errors/backend-sandbox-health-check-failed-error';
import type { BackendSandboxOpencodeRefreshFailedError } from '#common/types/backend/errors/backend-sandbox-opencode-refresh-failed-error';
import type { BackendSchedulerPublishReloadSessionFailedError } from '#common/types/backend/errors/backend-scheduler-publish-reload-session-failed-error';
import type { BackendSchedulerSyncEditorSessionStatusFailedError } from '#common/types/backend/errors/backend-scheduler-sync-editor-session-status-failed-error';
import type { BackendSessionApiKeyRequestNotAllowedError } from '#common/types/backend/errors/backend-session-api-key-request-not-allowed-error';
import type { BackendSessionBranchCannotBeCreatedError } from '#common/types/backend/errors/backend-session-branch-cannot-be-created-error';
import type { BackendSessionBranchCannotBeDeletedError } from '#common/types/backend/errors/backend-session-branch-cannot-be-deleted-error';
import type { BackendSessionBranchCannotBeMergedError } from '#common/types/backend/errors/backend-session-branch-cannot-be-merged-error';
import type { BackendSessionIsArchivedError } from '#common/types/backend/errors/backend-session-is-archived-error';
import type { BackendSessionIsInErrorStateError } from '#common/types/backend/errors/backend-session-is-in-error-state-error';
import type { BackendSessionNotFoundError } from '#common/types/backend/errors/backend-session-not-found-error';
import type { BackendSessionNotReadyError } from '#common/types/backend/errors/backend-session-not-ready-error';
import type { BackendSessionRepoCannotBeRevertedToRemoteError } from '#common/types/backend/errors/backend-session-repo-cannot-be-reverted-to-remote-error';
import type { BackendSessionTypeIsNotEditorError } from '#common/types/backend/errors/backend-session-type-is-not-editor-error';
import type { BackendSessionTypeIsNotExplorerError } from '#common/types/backend/errors/backend-session-type-is-not-explorer-error';
import type { BackendSignUpToSetPasswordError } from '#common/types/backend/errors/backend-sign-up-to-set-password-error';
import type { BackendSleepDoesNotWorkWithoutWaitError } from '#common/types/backend/errors/backend-sleep-does-not-work-without-wait-error';
import type { BackendSnowflakeFailedToDestroyConnectionError } from '#common/types/backend/errors/backend-snowflake-failed-to-destroy-connection-error';
import type { BackendSseStreamFailedError } from '#common/types/backend/errors/backend-sse-stream-failed-error';
import type { BackendStructDoesNotExistError } from '#common/types/backend/errors/backend-struct-does-not-exist-error';
import type { BackendStructIdChangedError } from '#common/types/backend/errors/backend-struct-id-changed-error';
import type { BackendSuggestFieldNotFoundError } from '#common/types/backend/errors/backend-suggest-field-not-found-error';
import type { BackendTestConnectionResultIsNotDefinedError } from '#common/types/backend/errors/backend-test-connection-result-is-not-defined-error';
import type { BackendTestRoutesForbiddenError } from '#common/types/backend/errors/backend-test-routes-forbidden-error';
import type { BackendThrottlerUserIdIsNotDefinedError } from '#common/types/backend/errors/backend-throttler-user-id-is-not-defined-error';
import type { BackendTileIndexDoesNotWorkWithoutDashboardIdError } from '#common/types/backend/errors/backend-tile-index-does-not-work-without-dashboard-id-error';
import type { BackendTooManyActiveEditorSessionsError } from '#common/types/backend/errors/backend-too-many-active-editor-sessions-error';
import type { BackendTransactionRetryError } from '#common/types/backend/errors/backend-transaction-retry-error';
import type { BackendUnauthorizedError } from '#common/types/backend/errors/backend-unauthorized-error';
import type { BackendUnknownSandboxTypeError } from '#common/types/backend/errors/backend-unknown-sandbox-type-error';
import type { BackendUpdatePasswordTokenExpiredError } from '#common/types/backend/errors/backend-update-password-token-expired-error';
import type { BackendUpdatePasswordWrongTokenError } from '#common/types/backend/errors/backend-update-password-wrong-token-error';
import type { BackendUserAliasIsUndefinedError } from '#common/types/backend/errors/backend-user-alias-is-undefined-error';
import type { BackendUserAlreadyRegisteredError } from '#common/types/backend/errors/backend-user-already-registered-error';
import type { BackendUserApiKeyRequestNotAllowedError } from '#common/types/backend/errors/backend-user-api-key-request-not-allowed-error';
import type { BackendUserDoesNotExistError } from '#common/types/backend/errors/backend-user-does-not-exist-error';
import type { BackendUserIsNotInvitedError } from '#common/types/backend/errors/backend-user-is-not-invited-error';
import type { BackendUserIsNotServerAdminError } from '#common/types/backend/errors/backend-user-is-not-server-admin-error';
import type { BackendUserIsOrgOwnerError } from '#common/types/backend/errors/backend-user-is-org-owner-error';
import type { BackendUserIsTheOnlyProjectAdminError } from '#common/types/backend/errors/backend-user-is-the-only-project-admin-error';
import type { BackendUserProfileCodexAuthNotSetError } from '#common/types/backend/errors/backend-user-profile-codex-auth-not-set-error';
import type { BackendWrongApiKeyFormatError } from '#common/types/backend/errors/backend-wrong-api-key-format-error';
import type { BackendWrongColumnNameError } from '#common/types/backend/errors/backend-wrong-column-name-error';
import type { BackendWrongGivenValueError } from '#common/types/backend/errors/backend-wrong-given-value-error';
import type { BackendWrongMotherduckDatabaseCharactersError } from '#common/types/backend/errors/backend-wrong-motherduck-database-characters-error';
import type { BackendWrongOffsetError } from '#common/types/backend/errors/backend-wrong-offset-error';
import type { BackendWrongPasswordError } from '#common/types/backend/errors/backend-wrong-password-error';
import type { BackendWrongSchemaNameError } from '#common/types/backend/errors/backend-wrong-schema-name-error';
import type { BackendWrongSpecialKeyError } from '#common/types/backend/errors/backend-wrong-special-key-error';
import type { BackendWrongTableNameError } from '#common/types/backend/errors/backend-wrong-table-name-error';
import type { BackendWrongTimeRangeError } from '#common/types/backend/errors/backend-wrong-time-range-error';
import type { BackendWrongTotalDiskShardsError } from '#common/types/backend/errors/backend-wrong-total-disk-shards-error';
import type { BlockmlUnexpectedUrlReadError } from '#common/types/backend/errors/blockml-unexpected-url-read-error';
import type { EnvVarValueMustBeTrueOrFalseError } from '#common/types/backend/errors/env-var-value-must-be-true-or-false-error';
import type { MalloyToQueryFailedError } from '#common/types/backend/errors/malloy-to-query-failed-error';
import type { ThrottlerError } from '#common/types/backend/errors/throttler-error';
import type { TooManyRequestsError } from '#common/types/backend/errors/too-many-requests-error';

export type BackendError =
  | BackendAdminCannotChangeHisAdminStatusError
  | BackendAdminCannotDeleteHimselfError
  | BackendApiHostDnsLookupFailedError
  | BackendApiHostIsBlockedByIpError
  | BackendApiHostIsBlockedByListError
  | BackendApiHostIsBlockedBySpecError
  | BackendApiHostIsBlockedBySuffixError
  | BackendApiInvalidUrlError
  | BackendApiKeyNotFoundError
  | BackendApiKeyNotValidError
  | BackendApiProtocolMustBeHttpsOrHttpError
  | BackendBigqueryCancelQueryJobFailError
  | BackendBranchAlreadyExistsError
  | BackendBranchDoesNotExistError
  | BackendBranchIdDoesNotMatchSessionError
  | BackendBridgeBranchEnvDoesNotExistError
  | BackendChartCreatorIdMismatchError
  | BackendChartDoesNotExistError
  | BackendChartIsNotDraftError
  | BackendChartNotFoundError
  | BackendCodexAuthSignInRequiredError
  | BackendCodexAuthTokenExpiresInIsMissingError
  | BackendCodexAuthTokenExpiresInIsTooShortError
  | BackendCodexDeviceAuthStartFailedError
  | BackendConnectionAlreadyExistsError
  | BackendConnectionDoesNotExistError
  | BackendConnectionSchemaIsNotFoundError
  | BackendConnectionTypeIsNotSupportedForSampleError
  | BackendCreateChartFailError
  | BackendCreateDashboardFailError
  | BackendCreateDraftDashboardFailedError
  | BackendCreateReportFailError
  | BackendCreateSessionFailedError
  | BackendCreationOfOrganizationsIsForbiddenError
  | BackendDashboardCreatorIdMismatchError
  | BackendDashboardDoesNotExistError
  | BackendDashboardIdChartIdAndReportIdAreNotDefinedError
  | BackendDashboardNotFoundError
  | BackendDatabricksFailedToCloseConnectionError
  | BackendDateConversionFailedError
  | BackendDbRecordHasBothDecryptedAndEncryptedPropsError
  | BackendDbRecordHasNoDecryptedAndNoEncryptedPropsError
  | BackendDbRecordIsDecryptedButHasKeyTagError
  | BackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError
  | BackendDefaultBranchCannotBeDeletedError
  | BackendEditorSessionLockFailedError
  | BackendEditDraftDashboardFailedError
  | BackendEnvAlreadyExistsError
  | BackendEnvDoesNotExistError
  | BackendEnvIdDoesNotMatchSessionError
  | BackendEnvProdCannotBeDeletedError
  | BackendEnvUserAlreadyExistsError
  | BackendErrorResponseFromBlockmlError
  | BackendErrorResponseFromDiskError
  | BackendEvAlreadyExistsError
  | BackendEvDoesNotExistError
  | BackendExplorerContextLimitReachedError
  | BackendFailedToGetInitialCommitError
  | BackendFetchConstraintsBigqueryError
  | BackendFetchConstraintsDatabricksError
  | BackendFetchConstraintsDuckdbError
  | BackendFetchConstraintsSnowflakeError
  | BackendFetchDatasetBigqueryError
  | BackendFetchFailedError
  | BackendFetchFkBigqueryError
  | BackendFetchFkDatabricksError
  | BackendFetchFkDuckdbError
  | BackendFetchFkMysqlError
  | BackendFetchFkPostgresError
  | BackendFetchFkSnowflakeError
  | BackendFetchTimeoutError
  | BackendForbiddenChartPathError
  | BackendForbiddenDashboardError
  | BackendForbiddenModelError
  | BackendForbiddenOrgError
  | BackendForbiddenReportError
  | BackendForbiddenRepoIdError
  | BackendGetDashboardFailError
  | BackendGetIdempRespRetryError
  | BackendGetIdempRespRetryFailedError
  | BackendGetProviderModelFailedError
  | BackendGivenAlreadyExistsError
  | BackendGivenDoesNotExistError
  | BackendHashSecretIsNotDefinedError
  | BackendIdempUserMismatchError
  | BackendInteractFailedError
  | BackendInteractTimeoutError
  | BackendMalloyConnectionCloseError
  | BackendManualCommitToProductionRepoIsForbiddenError
  | BackendMconfigDoesNotExistError
  | BackendMconfigParentIdMismatchError
  | BackendMconfigQueryIdMismatchError
  | BackendMemberAlreadyExistsError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendMemberIsNotAdminError
  | BackendMemberIsNotEditorError
  | BackendMemberIsNotEditorOrAdminError
  | BackendMemberIsNotExplorerError
  | BackendMessageAgentRequiredError
  | BackendMessageModelRequiredError
  | BackendMessageProviderRequiredError
  | BackendMessageVariantRequiredError
  | BackendModelDoesNotExistError
  | BackendModelIdIsNotDefinedError
  | BackendModifyChartFailError
  | BackendModifyDashboardFailError
  | BackendModifyReportFailError
  | BackendMutuallyExclusiveParamsError
  | BackendMysqlConnectionCloseError
  | BackendNewOwnerNotFoundError
  | BackendNoteDoesNotExistError
  | BackendNotAuthorizedError
  | BackendOnlyOrgOwnerCanAccessError
  | BackendOrgAlreadyExistsError
  | BackendOrgDoesNotExistError
  | BackendProductionRepoNotAllowedError
  | BackendProjectAlreadyExistsError
  | BackendProjectDoesNotExistError
  | BackendPromptFailedError
  | BackendProviderAlreadyExistsError
  | BackendProviderApiKeyRequiredError
  | BackendProviderDoesNotExistError
  | BackendProviderIsDisabledError
  | BackendLlmModelAlreadyExistsError
  | BackendLlmModelContextLimitRequiredError
  | BackendLlmModelDiscoveryFailedError
  | BackendLlmModelDoesNotExistError
  | BackendLlmModelLimitInvalidError
  | BackendLlmModelNotAvailableInBuilderError
  | BackendLlmModelNotAvailableInExplorerError
  | BackendLlmModelNotDiscoveredError
  | BackendLlmModelVariantsInvalidError
  | BackendLlmModelVariantNotAvailableError
  | BackendProviderNotValidApiKeyError
  | BackendProviderTypeMismatchError
  | BackendQueriesDoNotExistError
  | BackendQueryDoesNotExistError
  | BackendRefetchFromOpencodeFailedError
  | BackendReportCreatorIdMismatchError
  | BackendReportNotFoundError
  | BackendRepoIdDoesNotMatchSessionError
  | BackendRepoIdDoesNotMatchUserError
  | BackendRestrictedOrganizationError
  | BackendRestrictedOrganizationNameError
  | BackendRestrictedProjectError
  | BackendRestrictedUserError
  | BackendRolesDoNotExistError
  | BackendRoleAlreadyExistsError
  | BackendRoleDoesNotExistError
  | BackendRoleGivenAlreadyExistsError
  | BackendRoleGivenDoesNotExistError
  | BackendRowIdDoesNotWorkWithoutReportIdError
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
  | BackendSandboxCreateFailedError
  | BackendSandboxGitCheckoutFailedError
  | BackendSandboxGitCloneFailedError
  | BackendSandboxHealthCheckFailedError
  | BackendSandboxOpencodeRefreshFailedError
  | BackendSchedulerPublishReloadSessionFailedError
  | BackendSchedulerSyncEditorSessionStatusFailedError
  | BackendSessionApiKeyRequestNotAllowedError
  | BackendSessionBranchCannotBeCreatedError
  | BackendSessionBranchCannotBeDeletedError
  | BackendSessionBranchCannotBeMergedError
  | BackendSessionIsArchivedError
  | BackendSessionIsInErrorStateError
  | BackendSessionNotFoundError
  | BackendSessionNotReadyError
  | BackendSessionRepoCannotBeRevertedToRemoteError
  | BackendSessionTypeIsNotEditorError
  | BackendSessionTypeIsNotExplorerError
  | BackendSignUpToSetPasswordError
  | BackendSleepDoesNotWorkWithoutWaitError
  | BackendSnowflakeFailedToDestroyConnectionError
  | BackendSseStreamFailedError
  | BackendStructDoesNotExistError
  | BackendStructIdChangedError
  | BackendSuggestFieldNotFoundError
  | BackendTestConnectionResultIsNotDefinedError
  | BackendTestRoutesForbiddenError
  | BackendThrottlerUserIdIsNotDefinedError
  | BackendTileIndexDoesNotWorkWithoutDashboardIdError
  | BackendTooManyActiveEditorSessionsError
  | BackendTransactionRetryError
  | BackendUnauthorizedError
  | BackendUnknownSandboxTypeError
  | BackendUpdatePasswordTokenExpiredError
  | BackendUpdatePasswordWrongTokenError
  | BackendUserAliasIsUndefinedError
  | BackendUserAlreadyRegisteredError
  | BackendUserApiKeyRequestNotAllowedError
  | BackendUserDoesNotExistError
  | BackendUserIsNotInvitedError
  | BackendUserIsNotServerAdminError
  | BackendUserIsOrgOwnerError
  | BackendUserIsTheOnlyProjectAdminError
  | BackendUserProfileCodexAuthNotSetError
  | BackendWrongApiKeyFormatError
  | BackendWrongColumnNameError
  | BackendWrongGivenValueError
  | BackendWrongMotherduckDatabaseCharactersError
  | BackendWrongOffsetError
  | BackendWrongPasswordError
  | BackendWrongSchemaNameError
  | BackendWrongSpecialKeyError
  | BackendWrongTableNameError
  | BackendWrongTimeRangeError
  | BackendWrongTotalDiskShardsError
  | BlockmlUnexpectedUrlReadError
  | EnvVarValueMustBeTrueOrFalseError
  | MalloyToQueryFailedError
  | ThrottlerError
  | TooManyRequestsError
  | BackendInternalError
  | BackendInvalidRequestError;
