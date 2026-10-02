import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendAdminCannotChangeHisAdminStatusError,
  zBackendAdminCannotChangeHisAdminStatusError
} from '#common/types/backend/errors/backend-admin-cannot-change-his-admin-status-error';
import {
  type BackendAdminCannotDeleteHimselfError,
  zBackendAdminCannotDeleteHimselfError
} from '#common/types/backend/errors/backend-admin-cannot-delete-himself-error';
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
  type BackendApiKeyNotFoundError,
  zBackendApiKeyNotFoundError
} from '#common/types/backend/errors/backend-api-key-not-found-error';
import {
  type BackendApiKeyNotValidError,
  zBackendApiKeyNotValidError
} from '#common/types/backend/errors/backend-api-key-not-valid-error';
import {
  type BackendApiProtocolMustBeHttpsOrHttpError,
  zBackendApiProtocolMustBeHttpsOrHttpError
} from '#common/types/backend/errors/backend-api-protocol-must-be-https-or-http-error';
import {
  type BackendBigqueryCancelQueryJobFailError,
  zBackendBigqueryCancelQueryJobFailError
} from '#common/types/backend/errors/backend-bigquery-cancel-query-job-fail-error';
import {
  type BackendBranchAlreadyExistsError,
  zBackendBranchAlreadyExistsError
} from '#common/types/backend/errors/backend-branch-already-exists-error';
import {
  type BackendBranchDoesNotExistError,
  zBackendBranchDoesNotExistError
} from '#common/types/backend/errors/backend-branch-does-not-exist-error';
import {
  type BackendBranchIdDoesNotMatchSessionError,
  zBackendBranchIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-branch-id-does-not-match-session-error';
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
  type BackendChartIsNotDraftError,
  zBackendChartIsNotDraftError
} from '#common/types/backend/errors/backend-chart-is-not-draft-error';
import {
  type BackendChartNotFoundError,
  zBackendChartNotFoundError
} from '#common/types/backend/errors/backend-chart-not-found-error';
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
  type BackendCodexDeviceAuthStartFailedError,
  zBackendCodexDeviceAuthStartFailedError
} from '#common/types/backend/errors/backend-codex-device-auth-start-failed-error';
import {
  type BackendConnectionAlreadyExistsError,
  zBackendConnectionAlreadyExistsError
} from '#common/types/backend/errors/backend-connection-already-exists-error';
import {
  type BackendConnectionDoesNotExistError,
  zBackendConnectionDoesNotExistError
} from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import {
  type BackendConnectionSchemaIsNotFoundError,
  zBackendConnectionSchemaIsNotFoundError
} from '#common/types/backend/errors/backend-connection-schema-is-not-found-error';
import {
  type BackendConnectionTypeIsNotSupportedForSampleError,
  zBackendConnectionTypeIsNotSupportedForSampleError
} from '#common/types/backend/errors/backend-connection-type-is-not-supported-for-sample-error';
import {
  type BackendCreateChartFailError,
  zBackendCreateChartFailError
} from '#common/types/backend/errors/backend-create-chart-fail-error';
import {
  type BackendCreateDashboardFailError,
  zBackendCreateDashboardFailError
} from '#common/types/backend/errors/backend-create-dashboard-fail-error';
import {
  type BackendCreateDraftDashboardFailedError,
  zBackendCreateDraftDashboardFailedError
} from '#common/types/backend/errors/backend-create-draft-dashboard-failed-error';
import {
  type BackendCreateReportFailError,
  zBackendCreateReportFailError
} from '#common/types/backend/errors/backend-create-report-fail-error';
import {
  type BackendCreateSessionFailedError,
  zBackendCreateSessionFailedError
} from '#common/types/backend/errors/backend-create-session-failed-error';
import {
  type BackendCreationOfOrganizationsIsForbiddenError,
  zBackendCreationOfOrganizationsIsForbiddenError
} from '#common/types/backend/errors/backend-creation-of-organizations-is-forbidden-error';
import {
  type BackendDashboardCreatorIdMismatchError,
  zBackendDashboardCreatorIdMismatchError
} from '#common/types/backend/errors/backend-dashboard-creator-id-mismatch-error';
import {
  type BackendDashboardDoesNotExistError,
  zBackendDashboardDoesNotExistError
} from '#common/types/backend/errors/backend-dashboard-does-not-exist-error';
import {
  type BackendDashboardIdChartIdAndReportIdAreNotDefinedError,
  zBackendDashboardIdChartIdAndReportIdAreNotDefinedError
} from '#common/types/backend/errors/backend-dashboard-id-chart-id-and-report-id-are-not-defined-error';
import {
  type BackendDashboardNotFoundError,
  zBackendDashboardNotFoundError
} from '#common/types/backend/errors/backend-dashboard-not-found-error';
import {
  type BackendDatabricksFailedToCloseConnectionError,
  zBackendDatabricksFailedToCloseConnectionError
} from '#common/types/backend/errors/backend-databricks-failed-to-close-connection-error';
import {
  type BackendDateConversionFailedError,
  zBackendDateConversionFailedError
} from '#common/types/backend/errors/backend-date-conversion-failed-error';
import {
  type BackendDbRecordHasBothDecryptedAndEncryptedPropsError,
  zBackendDbRecordHasBothDecryptedAndEncryptedPropsError
} from '#common/types/backend/errors/backend-db-record-has-both-decrypted-and-encrypted-props-error';
import {
  type BackendDbRecordHasNoDecryptedAndNoEncryptedPropsError,
  zBackendDbRecordHasNoDecryptedAndNoEncryptedPropsError
} from '#common/types/backend/errors/backend-db-record-has-no-decrypted-and-no-encrypted-props-error';
import {
  type BackendDbRecordIsDecryptedButHasKeyTagError,
  zBackendDbRecordIsDecryptedButHasKeyTagError
} from '#common/types/backend/errors/backend-db-record-is-decrypted-but-has-key-tag-error';
import {
  type BackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError,
  zBackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError
} from '#common/types/backend/errors/backend-db-record-key-tag-does-not-match-current-or-prev-error';
import {
  type BackendDefaultBranchCannotBeDeletedError,
  zBackendDefaultBranchCannotBeDeletedError
} from '#common/types/backend/errors/backend-default-branch-cannot-be-deleted-error';
import {
  type BackendEditDraftDashboardFailedError,
  zBackendEditDraftDashboardFailedError
} from '#common/types/backend/errors/backend-edit-draft-dashboard-failed-error';
import {
  type BackendEditorSessionLockFailedError,
  zBackendEditorSessionLockFailedError
} from '#common/types/backend/errors/backend-editor-session-lock-failed-error';
import {
  type BackendEnvAlreadyExistsError,
  zBackendEnvAlreadyExistsError
} from '#common/types/backend/errors/backend-env-already-exists-error';
import {
  type BackendEnvDoesNotExistError,
  zBackendEnvDoesNotExistError
} from '#common/types/backend/errors/backend-env-does-not-exist-error';
import {
  type BackendEnvIdDoesNotMatchSessionError,
  zBackendEnvIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-env-id-does-not-match-session-error';
import {
  type BackendEnvProdCannotBeDeletedError,
  zBackendEnvProdCannotBeDeletedError
} from '#common/types/backend/errors/backend-env-prod-cannot-be-deleted-error';
import {
  type BackendEnvUserAlreadyExistsError,
  zBackendEnvUserAlreadyExistsError
} from '#common/types/backend/errors/backend-env-user-already-exists-error';
import {
  type BackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromBlockmlError
} from '#common/types/backend/errors/backend-error-response-from-blockml-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/types/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendEvAlreadyExistsError,
  zBackendEvAlreadyExistsError
} from '#common/types/backend/errors/backend-ev-already-exists-error';
import {
  type BackendEvDoesNotExistError,
  zBackendEvDoesNotExistError
} from '#common/types/backend/errors/backend-ev-does-not-exist-error';
import {
  type BackendExplorerContextLimitReachedError,
  zBackendExplorerContextLimitReachedError
} from '#common/types/backend/errors/backend-explorer-context-limit-reached-error';
import {
  type BackendFailedToGetInitialCommitError,
  zBackendFailedToGetInitialCommitError
} from '#common/types/backend/errors/backend-failed-to-get-initial-commit-error';
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
  type BackendFetchFailedError,
  zBackendFetchFailedError
} from '#common/types/backend/errors/backend-fetch-failed-error';
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
  type BackendFetchTimeoutError,
  zBackendFetchTimeoutError
} from '#common/types/backend/errors/backend-fetch-timeout-error';
import {
  type BackendForbiddenChartPathError,
  zBackendForbiddenChartPathError
} from '#common/types/backend/errors/backend-forbidden-chart-path-error';
import {
  type BackendForbiddenDashboardError,
  zBackendForbiddenDashboardError
} from '#common/types/backend/errors/backend-forbidden-dashboard-error';
import {
  type BackendForbiddenModelError,
  zBackendForbiddenModelError
} from '#common/types/backend/errors/backend-forbidden-model-error';
import {
  type BackendForbiddenOrgError,
  zBackendForbiddenOrgError
} from '#common/types/backend/errors/backend-forbidden-org-error';
import {
  type BackendForbiddenRepoIdError,
  zBackendForbiddenRepoIdError
} from '#common/types/backend/errors/backend-forbidden-repo-id-error';
import {
  type BackendForbiddenReportError,
  zBackendForbiddenReportError
} from '#common/types/backend/errors/backend-forbidden-report-error';
import {
  type BackendGetDashboardFailError,
  zBackendGetDashboardFailError
} from '#common/types/backend/errors/backend-get-dashboard-fail-error';
import {
  type BackendGetIdempRespRetryError,
  zBackendGetIdempRespRetryError
} from '#common/types/backend/errors/backend-get-idemp-resp-retry-error';
import {
  type BackendGetIdempRespRetryFailedError,
  zBackendGetIdempRespRetryFailedError
} from '#common/types/backend/errors/backend-get-idemp-resp-retry-failed-error';
import {
  type BackendGetProviderModelFailedError,
  zBackendGetProviderModelFailedError
} from '#common/types/backend/errors/backend-get-provider-model-failed-error';
import {
  type BackendGivenAlreadyExistsError,
  zBackendGivenAlreadyExistsError
} from '#common/types/backend/errors/backend-given-already-exists-error';
import {
  type BackendGivenDoesNotExistError,
  zBackendGivenDoesNotExistError
} from '#common/types/backend/errors/backend-given-does-not-exist-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendIdempUserMismatchError,
  zBackendIdempUserMismatchError
} from '#common/types/backend/errors/backend-idemp-user-mismatch-error';
import {
  type BackendInteractFailedError,
  zBackendInteractFailedError
} from '#common/types/backend/errors/backend-interact-failed-error';
import {
  type BackendInteractTimeoutError,
  zBackendInteractTimeoutError
} from '#common/types/backend/errors/backend-interact-timeout-error';
import {
  type BackendInternalError,
  zBackendInternalError
} from '#common/types/backend/errors/backend-internal-error';
import {
  type BackendInvalidRequestError,
  zBackendInvalidRequestError
} from '#common/types/backend/errors/backend-invalid-request-error';
import {
  type BackendMalloyConnectionCloseError,
  zBackendMalloyConnectionCloseError
} from '#common/types/backend/errors/backend-malloy-connection-close-error';
import {
  type BackendManualCommitToProductionRepoIsForbiddenError,
  zBackendManualCommitToProductionRepoIsForbiddenError
} from '#common/types/backend/errors/backend-manual-commit-to-production-repo-is-forbidden-error';
import {
  type BackendMconfigDoesNotExistError,
  zBackendMconfigDoesNotExistError
} from '#common/types/backend/errors/backend-mconfig-does-not-exist-error';
import {
  type BackendMconfigParentIdMismatchError,
  zBackendMconfigParentIdMismatchError
} from '#common/types/backend/errors/backend-mconfig-parent-id-mismatch-error';
import {
  type BackendMconfigQueryIdMismatchError,
  zBackendMconfigQueryIdMismatchError
} from '#common/types/backend/errors/backend-mconfig-query-id-mismatch-error';
import {
  type BackendMemberAlreadyExistsError,
  zBackendMemberAlreadyExistsError
} from '#common/types/backend/errors/backend-member-already-exists-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/types/backend/errors/backend-member-does-not-have-access-to-env-error';
import {
  type BackendMemberIsNotAdminError,
  zBackendMemberIsNotAdminError
} from '#common/types/backend/errors/backend-member-is-not-admin-error';
import {
  type BackendMemberIsNotEditorError,
  zBackendMemberIsNotEditorError
} from '#common/types/backend/errors/backend-member-is-not-editor-error';
import {
  type BackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotEditorOrAdminError
} from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import {
  type BackendMemberIsNotExplorerError,
  zBackendMemberIsNotExplorerError
} from '#common/types/backend/errors/backend-member-is-not-explorer-error';
import {
  type BackendMessageAgentRequiredError,
  zBackendMessageAgentRequiredError
} from '#common/types/backend/errors/backend-message-agent-required-error';
import {
  type BackendMessageModelRequiredError,
  zBackendMessageModelRequiredError
} from '#common/types/backend/errors/backend-message-model-required-error';
import {
  type BackendMessageProviderRequiredError,
  zBackendMessageProviderRequiredError
} from '#common/types/backend/errors/backend-message-provider-required-error';
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
  type BackendModifyChartFailError,
  zBackendModifyChartFailError
} from '#common/types/backend/errors/backend-modify-chart-fail-error';
import {
  type BackendModifyDashboardFailError,
  zBackendModifyDashboardFailError
} from '#common/types/backend/errors/backend-modify-dashboard-fail-error';
import {
  type BackendModifyReportFailError,
  zBackendModifyReportFailError
} from '#common/types/backend/errors/backend-modify-report-fail-error';
import {
  type BackendMutuallyExclusiveParamsError,
  zBackendMutuallyExclusiveParamsError
} from '#common/types/backend/errors/backend-mutually-exclusive-params-error';
import {
  type BackendMysqlConnectionCloseError,
  zBackendMysqlConnectionCloseError
} from '#common/types/backend/errors/backend-mysql-connection-close-error';
import {
  type BackendNewOwnerNotFoundError,
  zBackendNewOwnerNotFoundError
} from '#common/types/backend/errors/backend-new-owner-not-found-error';
import {
  type BackendNotAuthorizedError,
  zBackendNotAuthorizedError
} from '#common/types/backend/errors/backend-not-authorized-error';
import {
  type BackendNoteDoesNotExistError,
  zBackendNoteDoesNotExistError
} from '#common/types/backend/errors/backend-note-does-not-exist-error';
import {
  type BackendOnlyOrgOwnerCanAccessError,
  zBackendOnlyOrgOwnerCanAccessError
} from '#common/types/backend/errors/backend-only-org-owner-can-access-error';
import {
  type BackendOrgAlreadyExistsError,
  zBackendOrgAlreadyExistsError
} from '#common/types/backend/errors/backend-org-already-exists-error';
import {
  type BackendOrgDoesNotExistError,
  zBackendOrgDoesNotExistError
} from '#common/types/backend/errors/backend-org-does-not-exist-error';
import {
  type BackendProductionRepoNotAllowedError,
  zBackendProductionRepoNotAllowedError
} from '#common/types/backend/errors/backend-production-repo-not-allowed-error';
import {
  type BackendProjectAlreadyExistsError,
  zBackendProjectAlreadyExistsError
} from '#common/types/backend/errors/backend-project-already-exists-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendPromptFailedError,
  zBackendPromptFailedError
} from '#common/types/backend/errors/backend-prompt-failed-error';
import {
  type BackendProviderAlreadyExistsError,
  zBackendProviderAlreadyExistsError
} from '#common/types/backend/errors/backend-provider-already-exists-error';
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
  type BackendProviderModelAlreadyExistsError,
  zBackendProviderModelAlreadyExistsError
} from '#common/types/backend/errors/backend-provider-model-already-exists-error';
import {
  type BackendProviderModelContextLimitRequiredError,
  zBackendProviderModelContextLimitRequiredError
} from '#common/types/backend/errors/backend-provider-model-context-limit-required-error';
import {
  type BackendProviderModelDiscoveryFailedError,
  zBackendProviderModelDiscoveryFailedError
} from '#common/types/backend/errors/backend-provider-model-discovery-failed-error';
import {
  type BackendProviderModelDoesNotExistError,
  zBackendProviderModelDoesNotExistError
} from '#common/types/backend/errors/backend-provider-model-does-not-exist-error';
import {
  type BackendProviderModelLimitInvalidError,
  zBackendProviderModelLimitInvalidError
} from '#common/types/backend/errors/backend-provider-model-limit-invalid-error';
import {
  type BackendProviderModelNotAvailableInBuilderError,
  zBackendProviderModelNotAvailableInBuilderError
} from '#common/types/backend/errors/backend-provider-model-not-available-in-builder-error';
import {
  type BackendProviderModelNotAvailableInExplorerError,
  zBackendProviderModelNotAvailableInExplorerError
} from '#common/types/backend/errors/backend-provider-model-not-available-in-explorer-error';
import {
  type BackendProviderModelNotDiscoveredError,
  zBackendProviderModelNotDiscoveredError
} from '#common/types/backend/errors/backend-provider-model-not-discovered-error';
import {
  type BackendProviderModelVariantNotAvailableError,
  zBackendProviderModelVariantNotAvailableError
} from '#common/types/backend/errors/backend-provider-model-variant-not-available-error';
import {
  type BackendProviderModelVariantsInvalidError,
  zBackendProviderModelVariantsInvalidError
} from '#common/types/backend/errors/backend-provider-model-variants-invalid-error';
import {
  type BackendProviderNotValidApiKeyError,
  zBackendProviderNotValidApiKeyError
} from '#common/types/backend/errors/backend-provider-not-valid-api-key-error';
import {
  type BackendProviderTypeMismatchError,
  zBackendProviderTypeMismatchError
} from '#common/types/backend/errors/backend-provider-type-mismatch-error';
import {
  type BackendQueriesDoNotExistError,
  zBackendQueriesDoNotExistError
} from '#common/types/backend/errors/backend-queries-do-not-exist-error';
import {
  type BackendQueryDoesNotExistError,
  zBackendQueryDoesNotExistError
} from '#common/types/backend/errors/backend-query-does-not-exist-error';
import {
  type BackendRefetchFromOpencodeFailedError,
  zBackendRefetchFromOpencodeFailedError
} from '#common/types/backend/errors/backend-refetch-from-opencode-failed-error';
import {
  type BackendRepoIdDoesNotMatchSessionError,
  zBackendRepoIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-repo-id-does-not-match-session-error';
import {
  type BackendRepoIdDoesNotMatchUserError,
  zBackendRepoIdDoesNotMatchUserError
} from '#common/types/backend/errors/backend-repo-id-does-not-match-user-error';
import {
  type BackendReportCreatorIdMismatchError,
  zBackendReportCreatorIdMismatchError
} from '#common/types/backend/errors/backend-report-creator-id-mismatch-error';
import {
  type BackendReportNotFoundError,
  zBackendReportNotFoundError
} from '#common/types/backend/errors/backend-report-not-found-error';
import {
  type BackendRestrictedOrganizationError,
  zBackendRestrictedOrganizationError
} from '#common/types/backend/errors/backend-restricted-organization-error';
import {
  type BackendRestrictedOrganizationNameError,
  zBackendRestrictedOrganizationNameError
} from '#common/types/backend/errors/backend-restricted-organization-name-error';
import {
  type BackendRestrictedProjectError,
  zBackendRestrictedProjectError
} from '#common/types/backend/errors/backend-restricted-project-error';
import {
  type BackendRestrictedUserError,
  zBackendRestrictedUserError
} from '#common/types/backend/errors/backend-restricted-user-error';
import {
  type BackendRoleAlreadyExistsError,
  zBackendRoleAlreadyExistsError
} from '#common/types/backend/errors/backend-role-already-exists-error';
import {
  type BackendRoleDoesNotExistError,
  zBackendRoleDoesNotExistError
} from '#common/types/backend/errors/backend-role-does-not-exist-error';
import {
  type BackendRoleGivenAlreadyExistsError,
  zBackendRoleGivenAlreadyExistsError
} from '#common/types/backend/errors/backend-role-given-already-exists-error';
import {
  type BackendRoleGivenDoesNotExistError,
  zBackendRoleGivenDoesNotExistError
} from '#common/types/backend/errors/backend-role-given-does-not-exist-error';
import {
  type BackendRolesDoNotExistError,
  zBackendRolesDoNotExistError
} from '#common/types/backend/errors/backend-roles-do-not-exist-error';
import {
  type BackendRowIdDoesNotWorkWithoutReportIdError,
  zBackendRowIdDoesNotWorkWithoutReportIdError
} from '#common/types/backend/errors/backend-row-id-does-not-work-without-report-id-error';
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
  type BackendSandboxCreateFailedError,
  zBackendSandboxCreateFailedError
} from '#common/types/backend/errors/backend-sandbox-create-failed-error';
import {
  type BackendSandboxGitCheckoutFailedError,
  zBackendSandboxGitCheckoutFailedError
} from '#common/types/backend/errors/backend-sandbox-git-checkout-failed-error';
import {
  type BackendSandboxGitCloneFailedError,
  zBackendSandboxGitCloneFailedError
} from '#common/types/backend/errors/backend-sandbox-git-clone-failed-error';
import {
  type BackendSandboxHealthCheckFailedError,
  zBackendSandboxHealthCheckFailedError
} from '#common/types/backend/errors/backend-sandbox-health-check-failed-error';
import {
  type BackendSandboxOpencodeRefreshFailedError,
  zBackendSandboxOpencodeRefreshFailedError
} from '#common/types/backend/errors/backend-sandbox-opencode-refresh-failed-error';
import {
  type BackendSchedulerPublishReloadSessionFailedError,
  zBackendSchedulerPublishReloadSessionFailedError
} from '#common/types/backend/errors/backend-scheduler-publish-reload-session-failed-error';
import {
  type BackendSchedulerSyncEditorSessionStatusFailedError,
  zBackendSchedulerSyncEditorSessionStatusFailedError
} from '#common/types/backend/errors/backend-scheduler-sync-editor-session-status-failed-error';
import {
  type BackendSessionApiKeyRequestNotAllowedError,
  zBackendSessionApiKeyRequestNotAllowedError
} from '#common/types/backend/errors/backend-session-api-key-request-not-allowed-error';
import {
  type BackendSessionBranchCannotBeCreatedError,
  zBackendSessionBranchCannotBeCreatedError
} from '#common/types/backend/errors/backend-session-branch-cannot-be-created-error';
import {
  type BackendSessionBranchCannotBeDeletedError,
  zBackendSessionBranchCannotBeDeletedError
} from '#common/types/backend/errors/backend-session-branch-cannot-be-deleted-error';
import {
  type BackendSessionBranchCannotBeMergedError,
  zBackendSessionBranchCannotBeMergedError
} from '#common/types/backend/errors/backend-session-branch-cannot-be-merged-error';
import {
  type BackendSessionIsArchivedError,
  zBackendSessionIsArchivedError
} from '#common/types/backend/errors/backend-session-is-archived-error';
import {
  type BackendSessionIsInErrorStateError,
  zBackendSessionIsInErrorStateError
} from '#common/types/backend/errors/backend-session-is-in-error-state-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/types/backend/errors/backend-session-not-found-error';
import {
  type BackendSessionNotReadyError,
  zBackendSessionNotReadyError
} from '#common/types/backend/errors/backend-session-not-ready-error';
import {
  type BackendSessionRepoCannotBeRevertedToRemoteError,
  zBackendSessionRepoCannotBeRevertedToRemoteError
} from '#common/types/backend/errors/backend-session-repo-cannot-be-reverted-to-remote-error';
import {
  type BackendSessionTypeIsNotEditorError,
  zBackendSessionTypeIsNotEditorError
} from '#common/types/backend/errors/backend-session-type-is-not-editor-error';
import {
  type BackendSessionTypeIsNotExplorerError,
  zBackendSessionTypeIsNotExplorerError
} from '#common/types/backend/errors/backend-session-type-is-not-explorer-error';
import {
  type BackendSignUpToSetPasswordError,
  zBackendSignUpToSetPasswordError
} from '#common/types/backend/errors/backend-sign-up-to-set-password-error';
import {
  type BackendSleepDoesNotWorkWithoutWaitError,
  zBackendSleepDoesNotWorkWithoutWaitError
} from '#common/types/backend/errors/backend-sleep-does-not-work-without-wait-error';
import {
  type BackendSnowflakeFailedToDestroyConnectionError,
  zBackendSnowflakeFailedToDestroyConnectionError
} from '#common/types/backend/errors/backend-snowflake-failed-to-destroy-connection-error';
import {
  type BackendSseStreamFailedError,
  zBackendSseStreamFailedError
} from '#common/types/backend/errors/backend-sse-stream-failed-error';
import {
  type BackendStructDoesNotExistError,
  zBackendStructDoesNotExistError
} from '#common/types/backend/errors/backend-struct-does-not-exist-error';
import {
  type BackendStructIdChangedError,
  zBackendStructIdChangedError
} from '#common/types/backend/errors/backend-struct-id-changed-error';
import {
  type BackendSuggestFieldNotFoundError,
  zBackendSuggestFieldNotFoundError
} from '#common/types/backend/errors/backend-suggest-field-not-found-error';
import {
  type BackendTestConnectionResultIsNotDefinedError,
  zBackendTestConnectionResultIsNotDefinedError
} from '#common/types/backend/errors/backend-test-connection-result-is-not-defined-error';
import {
  type BackendTestRoutesForbiddenError,
  zBackendTestRoutesForbiddenError
} from '#common/types/backend/errors/backend-test-routes-forbidden-error';
import {
  type BackendThrottlerUserIdIsNotDefinedError,
  zBackendThrottlerUserIdIsNotDefinedError
} from '#common/types/backend/errors/backend-throttler-user-id-is-not-defined-error';
import {
  type BackendTileIndexDoesNotWorkWithoutDashboardIdError,
  zBackendTileIndexDoesNotWorkWithoutDashboardIdError
} from '#common/types/backend/errors/backend-tile-index-does-not-work-without-dashboard-id-error';
import {
  type BackendTooManyActiveEditorSessionsError,
  zBackendTooManyActiveEditorSessionsError
} from '#common/types/backend/errors/backend-too-many-active-editor-sessions-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendUnauthorizedError,
  zBackendUnauthorizedError
} from '#common/types/backend/errors/backend-unauthorized-error';
import {
  type BackendUnknownSandboxTypeError,
  zBackendUnknownSandboxTypeError
} from '#common/types/backend/errors/backend-unknown-sandbox-type-error';
import {
  type BackendUpdatePasswordTokenExpiredError,
  zBackendUpdatePasswordTokenExpiredError
} from '#common/types/backend/errors/backend-update-password-token-expired-error';
import {
  type BackendUpdatePasswordWrongTokenError,
  zBackendUpdatePasswordWrongTokenError
} from '#common/types/backend/errors/backend-update-password-wrong-token-error';
import {
  type BackendUserAliasIsUndefinedError,
  zBackendUserAliasIsUndefinedError
} from '#common/types/backend/errors/backend-user-alias-is-undefined-error';
import {
  type BackendUserAlreadyRegisteredError,
  zBackendUserAlreadyRegisteredError
} from '#common/types/backend/errors/backend-user-already-registered-error';
import {
  type BackendUserApiKeyRequestNotAllowedError,
  zBackendUserApiKeyRequestNotAllowedError
} from '#common/types/backend/errors/backend-user-api-key-request-not-allowed-error';
import {
  type BackendUserDoesNotExistError,
  zBackendUserDoesNotExistError
} from '#common/types/backend/errors/backend-user-does-not-exist-error';
import {
  type BackendUserIsNotInvitedError,
  zBackendUserIsNotInvitedError
} from '#common/types/backend/errors/backend-user-is-not-invited-error';
import {
  type BackendUserIsNotServerAdminError,
  zBackendUserIsNotServerAdminError
} from '#common/types/backend/errors/backend-user-is-not-server-admin-error';
import {
  type BackendUserIsOrgOwnerError,
  zBackendUserIsOrgOwnerError
} from '#common/types/backend/errors/backend-user-is-org-owner-error';
import {
  type BackendUserIsTheOnlyProjectAdminError,
  zBackendUserIsTheOnlyProjectAdminError
} from '#common/types/backend/errors/backend-user-is-the-only-project-admin-error';
import {
  type BackendUserProfileCodexAuthNotSetError,
  zBackendUserProfileCodexAuthNotSetError
} from '#common/types/backend/errors/backend-user-profile-codex-auth-not-set-error';
import {
  type BackendWrongApiKeyFormatError,
  zBackendWrongApiKeyFormatError
} from '#common/types/backend/errors/backend-wrong-api-key-format-error';
import {
  type BackendWrongColumnNameError,
  zBackendWrongColumnNameError
} from '#common/types/backend/errors/backend-wrong-column-name-error';
import {
  type BackendWrongGivenValueError,
  zBackendWrongGivenValueError
} from '#common/types/backend/errors/backend-wrong-given-value-error';
import {
  type BackendWrongMotherduckDatabaseCharactersError,
  zBackendWrongMotherduckDatabaseCharactersError
} from '#common/types/backend/errors/backend-wrong-motherduck-database-characters-error';
import {
  type BackendWrongOffsetError,
  zBackendWrongOffsetError
} from '#common/types/backend/errors/backend-wrong-offset-error';
import {
  type BackendWrongPasswordError,
  zBackendWrongPasswordError
} from '#common/types/backend/errors/backend-wrong-password-error';
import {
  type BackendWrongSchemaNameError,
  zBackendWrongSchemaNameError
} from '#common/types/backend/errors/backend-wrong-schema-name-error';
import {
  type BackendWrongSpecialKeyError,
  zBackendWrongSpecialKeyError
} from '#common/types/backend/errors/backend-wrong-special-key-error';
import {
  type BackendWrongTableNameError,
  zBackendWrongTableNameError
} from '#common/types/backend/errors/backend-wrong-table-name-error';
import {
  type BackendWrongTimeRangeError,
  zBackendWrongTimeRangeError
} from '#common/types/backend/errors/backend-wrong-time-range-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/types/backend/errors/backend-wrong-total-disk-shards-error';
import {
  type BlockmlUnexpectedUrlReadError,
  zBlockmlUnexpectedUrlReadError
} from '#common/types/backend/errors/blockml-unexpected-url-read-error';
import {
  type EnvVarValueMustBeTrueOrFalseError,
  zEnvVarValueMustBeTrueOrFalseError
} from '#common/types/backend/errors/env-var-value-must-be-true-or-false-error';
import {
  type MalloyToQueryFailedError,
  zMalloyToQueryFailedError
} from '#common/types/backend/errors/malloy-to-query-failed-error';
import {
  type ThrottlerError,
  zThrottlerError
} from '#common/types/backend/errors/throttler-error';
import {
  type TooManyRequestsError,
  zTooManyRequestsError
} from '#common/types/backend/errors/too-many-requests-error';

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
  | BackendProviderModelAlreadyExistsError
  | BackendProviderModelContextLimitRequiredError
  | BackendProviderModelDiscoveryFailedError
  | BackendProviderModelDoesNotExistError
  | BackendProviderModelLimitInvalidError
  | BackendProviderModelNotAvailableInBuilderError
  | BackendProviderModelNotAvailableInExplorerError
  | BackendProviderModelNotDiscoveredError
  | BackendProviderModelVariantsInvalidError
  | BackendProviderModelVariantNotAvailableError
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

export let zBackendError = z.discriminatedUnion('code', [
  zBackendAdminCannotChangeHisAdminStatusError,
  zBackendAdminCannotDeleteHimselfError,
  zBackendApiHostDnsLookupFailedError,
  zBackendApiHostIsBlockedByIpError,
  zBackendApiHostIsBlockedByListError,
  zBackendApiHostIsBlockedBySpecError,
  zBackendApiHostIsBlockedBySuffixError,
  zBackendApiInvalidUrlError,
  zBackendApiKeyNotFoundError,
  zBackendApiKeyNotValidError,
  zBackendApiProtocolMustBeHttpsOrHttpError,
  zBackendBigqueryCancelQueryJobFailError,
  zBackendBranchAlreadyExistsError,
  zBackendBranchDoesNotExistError,
  zBackendBranchIdDoesNotMatchSessionError,
  zBackendBridgeBranchEnvDoesNotExistError,
  zBackendChartCreatorIdMismatchError,
  zBackendChartDoesNotExistError,
  zBackendChartIsNotDraftError,
  zBackendChartNotFoundError,
  zBackendCodexAuthSignInRequiredError,
  zBackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendCodexDeviceAuthStartFailedError,
  zBackendConnectionAlreadyExistsError,
  zBackendConnectionDoesNotExistError,
  zBackendConnectionSchemaIsNotFoundError,
  zBackendConnectionTypeIsNotSupportedForSampleError,
  zBackendCreateChartFailError,
  zBackendCreateDashboardFailError,
  zBackendCreateDraftDashboardFailedError,
  zBackendCreateReportFailError,
  zBackendCreateSessionFailedError,
  zBackendCreationOfOrganizationsIsForbiddenError,
  zBackendDashboardCreatorIdMismatchError,
  zBackendDashboardDoesNotExistError,
  zBackendDashboardIdChartIdAndReportIdAreNotDefinedError,
  zBackendDashboardNotFoundError,
  zBackendDatabricksFailedToCloseConnectionError,
  zBackendDateConversionFailedError,
  zBackendDbRecordHasBothDecryptedAndEncryptedPropsError,
  zBackendDbRecordHasNoDecryptedAndNoEncryptedPropsError,
  zBackendDbRecordIsDecryptedButHasKeyTagError,
  zBackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError,
  zBackendDefaultBranchCannotBeDeletedError,
  zBackendEditorSessionLockFailedError,
  zBackendEditDraftDashboardFailedError,
  zBackendEnvAlreadyExistsError,
  zBackendEnvDoesNotExistError,
  zBackendEnvIdDoesNotMatchSessionError,
  zBackendEnvProdCannotBeDeletedError,
  zBackendEnvUserAlreadyExistsError,
  zBackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromDiskError,
  zBackendEvAlreadyExistsError,
  zBackendEvDoesNotExistError,
  zBackendExplorerContextLimitReachedError,
  zBackendFailedToGetInitialCommitError,
  zBackendFetchConstraintsBigqueryError,
  zBackendFetchConstraintsDatabricksError,
  zBackendFetchConstraintsDuckdbError,
  zBackendFetchConstraintsSnowflakeError,
  zBackendFetchDatasetBigqueryError,
  zBackendFetchFailedError,
  zBackendFetchFkBigqueryError,
  zBackendFetchFkDatabricksError,
  zBackendFetchFkDuckdbError,
  zBackendFetchFkMysqlError,
  zBackendFetchFkPostgresError,
  zBackendFetchFkSnowflakeError,
  zBackendFetchTimeoutError,
  zBackendForbiddenChartPathError,
  zBackendForbiddenDashboardError,
  zBackendForbiddenModelError,
  zBackendForbiddenOrgError,
  zBackendForbiddenReportError,
  zBackendForbiddenRepoIdError,
  zBackendGetDashboardFailError,
  zBackendGetIdempRespRetryError,
  zBackendGetIdempRespRetryFailedError,
  zBackendGetProviderModelFailedError,
  zBackendGivenAlreadyExistsError,
  zBackendGivenDoesNotExistError,
  zBackendHashSecretIsNotDefinedError,
  zBackendIdempUserMismatchError,
  zBackendInteractFailedError,
  zBackendInteractTimeoutError,
  zBackendMalloyConnectionCloseError,
  zBackendManualCommitToProductionRepoIsForbiddenError,
  zBackendMconfigDoesNotExistError,
  zBackendMconfigParentIdMismatchError,
  zBackendMconfigQueryIdMismatchError,
  zBackendMemberAlreadyExistsError,
  zBackendMemberDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberIsNotAdminError,
  zBackendMemberIsNotEditorError,
  zBackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotExplorerError,
  zBackendMessageAgentRequiredError,
  zBackendMessageModelRequiredError,
  zBackendMessageProviderRequiredError,
  zBackendMessageVariantRequiredError,
  zBackendModelDoesNotExistError,
  zBackendModelIdIsNotDefinedError,
  zBackendModifyChartFailError,
  zBackendModifyDashboardFailError,
  zBackendModifyReportFailError,
  zBackendMutuallyExclusiveParamsError,
  zBackendMysqlConnectionCloseError,
  zBackendNewOwnerNotFoundError,
  zBackendNoteDoesNotExistError,
  zBackendNotAuthorizedError,
  zBackendOnlyOrgOwnerCanAccessError,
  zBackendOrgAlreadyExistsError,
  zBackendOrgDoesNotExistError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectAlreadyExistsError,
  zBackendProjectDoesNotExistError,
  zBackendPromptFailedError,
  zBackendProviderAlreadyExistsError,
  zBackendProviderApiKeyRequiredError,
  zBackendProviderDoesNotExistError,
  zBackendProviderIsDisabledError,
  zBackendProviderModelAlreadyExistsError,
  zBackendProviderModelContextLimitRequiredError,
  zBackendProviderModelDiscoveryFailedError,
  zBackendProviderModelDoesNotExistError,
  zBackendProviderModelLimitInvalidError,
  zBackendProviderModelNotAvailableInBuilderError,
  zBackendProviderModelNotAvailableInExplorerError,
  zBackendProviderModelNotDiscoveredError,
  zBackendProviderModelVariantsInvalidError,
  zBackendProviderModelVariantNotAvailableError,
  zBackendProviderNotValidApiKeyError,
  zBackendProviderTypeMismatchError,
  zBackendQueriesDoNotExistError,
  zBackendQueryDoesNotExistError,
  zBackendRefetchFromOpencodeFailedError,
  zBackendReportCreatorIdMismatchError,
  zBackendReportNotFoundError,
  zBackendRepoIdDoesNotMatchSessionError,
  zBackendRepoIdDoesNotMatchUserError,
  zBackendRestrictedOrganizationError,
  zBackendRestrictedOrganizationNameError,
  zBackendRestrictedProjectError,
  zBackendRestrictedUserError,
  zBackendRolesDoNotExistError,
  zBackendRoleAlreadyExistsError,
  zBackendRoleDoesNotExistError,
  zBackendRoleGivenAlreadyExistsError,
  zBackendRoleGivenDoesNotExistError,
  zBackendRowIdDoesNotWorkWithoutReportIdError,
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
  zBackendSandboxCreateFailedError,
  zBackendSandboxGitCheckoutFailedError,
  zBackendSandboxGitCloneFailedError,
  zBackendSandboxHealthCheckFailedError,
  zBackendSandboxOpencodeRefreshFailedError,
  zBackendSchedulerPublishReloadSessionFailedError,
  zBackendSchedulerSyncEditorSessionStatusFailedError,
  zBackendSessionApiKeyRequestNotAllowedError,
  zBackendSessionBranchCannotBeCreatedError,
  zBackendSessionBranchCannotBeDeletedError,
  zBackendSessionBranchCannotBeMergedError,
  zBackendSessionIsArchivedError,
  zBackendSessionIsInErrorStateError,
  zBackendSessionNotFoundError,
  zBackendSessionNotReadyError,
  zBackendSessionRepoCannotBeRevertedToRemoteError,
  zBackendSessionTypeIsNotEditorError,
  zBackendSessionTypeIsNotExplorerError,
  zBackendSignUpToSetPasswordError,
  zBackendSleepDoesNotWorkWithoutWaitError,
  zBackendSnowflakeFailedToDestroyConnectionError,
  zBackendSseStreamFailedError,
  zBackendStructDoesNotExistError,
  zBackendStructIdChangedError,
  zBackendSuggestFieldNotFoundError,
  zBackendTestConnectionResultIsNotDefinedError,
  zBackendTestRoutesForbiddenError,
  zBackendThrottlerUserIdIsNotDefinedError,
  zBackendTileIndexDoesNotWorkWithoutDashboardIdError,
  zBackendTooManyActiveEditorSessionsError,
  zBackendTransactionRetryError,
  zBackendUnauthorizedError,
  zBackendUnknownSandboxTypeError,
  zBackendUpdatePasswordTokenExpiredError,
  zBackendUpdatePasswordWrongTokenError,
  zBackendUserAliasIsUndefinedError,
  zBackendUserAlreadyRegisteredError,
  zBackendUserApiKeyRequestNotAllowedError,
  zBackendUserDoesNotExistError,
  zBackendUserIsNotInvitedError,
  zBackendUserIsNotServerAdminError,
  zBackendUserIsOrgOwnerError,
  zBackendUserIsTheOnlyProjectAdminError,
  zBackendUserProfileCodexAuthNotSetError,
  zBackendWrongApiKeyFormatError,
  zBackendWrongColumnNameError,
  zBackendWrongGivenValueError,
  zBackendWrongMotherduckDatabaseCharactersError,
  zBackendWrongOffsetError,
  zBackendWrongPasswordError,
  zBackendWrongSchemaNameError,
  zBackendWrongSpecialKeyError,
  zBackendWrongTableNameError,
  zBackendWrongTimeRangeError,
  zBackendWrongTotalDiskShardsError,
  zBlockmlUnexpectedUrlReadError,
  zEnvVarValueMustBeTrueOrFalseError,
  zMalloyToQueryFailedError,
  zThrottlerError,
  zTooManyRequestsError,
  zBackendInternalError,
  zBackendInvalidRequestError
]);

assertTypesEqual<BackendError, z.infer<typeof zBackendError>>({ value: true });
