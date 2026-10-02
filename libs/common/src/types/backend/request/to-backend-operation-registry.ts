import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendGetAvatarBigRequest,
  zToBackendGetAvatarBigRequest
} from '#common/types/backend/routes/avatars/get-avatar-big/get-avatar-big-request';
import {
  type ToBackendGetAvatarBigResponse,
  zToBackendGetAvatarBigResponse
} from '#common/types/backend/routes/avatars/get-avatar-big/get-avatar-big-response';
import {
  type ToBackendSetAvatarRequest,
  zToBackendSetAvatarRequest
} from '#common/types/backend/routes/avatars/set-avatar/set-avatar-request';
import {
  type ToBackendSetAvatarResponse,
  zToBackendSetAvatarResponse
} from '#common/types/backend/routes/avatars/set-avatar/set-avatar-response';
import {
  type ToBackendCreateBranchRequest,
  zToBackendCreateBranchRequest
} from '#common/types/backend/routes/branches/create-branch/create-branch-request';
import {
  type ToBackendCreateBranchResponse,
  zToBackendCreateBranchResponse
} from '#common/types/backend/routes/branches/create-branch/create-branch-response';
import {
  type ToBackendDeleteBranchRequest,
  zToBackendDeleteBranchRequest
} from '#common/types/backend/routes/branches/delete-branch/delete-branch-request';
import {
  type ToBackendDeleteBranchResponse,
  zToBackendDeleteBranchResponse
} from '#common/types/backend/routes/branches/delete-branch/delete-branch-response';
import {
  type ToBackendGetBranchesListRequest,
  zToBackendGetBranchesListRequest
} from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-request';
import {
  type ToBackendGetBranchesListResponse,
  zToBackendGetBranchesListResponse
} from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-response';
import {
  type ToBackendIsBranchExistRequest,
  zToBackendIsBranchExistRequest
} from '#common/types/backend/routes/branches/is-branch-exist/is-branch-exist-request';
import {
  type ToBackendIsBranchExistResponse,
  zToBackendIsBranchExistResponse
} from '#common/types/backend/routes/branches/is-branch-exist/is-branch-exist-response';
import {
  type ToBackendMoveCatalogNodeRequest,
  zToBackendMoveCatalogNodeRequest
} from '#common/types/backend/routes/catalogs/move-catalog-node/move-catalog-node-request';
import {
  type ToBackendMoveCatalogNodeResponse,
  zToBackendMoveCatalogNodeResponse
} from '#common/types/backend/routes/catalogs/move-catalog-node/move-catalog-node-response';
import {
  type ToBackendRenameCatalogNodeRequest,
  zToBackendRenameCatalogNodeRequest
} from '#common/types/backend/routes/catalogs/rename-catalog-node/rename-catalog-node-request';
import {
  type ToBackendRenameCatalogNodeResponse,
  zToBackendRenameCatalogNodeResponse
} from '#common/types/backend/routes/catalogs/rename-catalog-node/rename-catalog-node-response';
import {
  type ToBackendCreateDraftChartRequest,
  zToBackendCreateDraftChartRequest
} from '#common/types/backend/routes/charts/create-draft-chart/create-draft-chart-request';
import {
  type ToBackendCreateDraftChartResponse,
  zToBackendCreateDraftChartResponse
} from '#common/types/backend/routes/charts/create-draft-chart/create-draft-chart-response';
import {
  type ToBackendDeleteChartRequest,
  zToBackendDeleteChartRequest
} from '#common/types/backend/routes/charts/delete-chart/delete-chart-request';
import {
  type ToBackendDeleteChartResponse,
  zToBackendDeleteChartResponse
} from '#common/types/backend/routes/charts/delete-chart/delete-chart-response';
import {
  type ToBackendDeleteDraftChartsRequest,
  zToBackendDeleteDraftChartsRequest
} from '#common/types/backend/routes/charts/delete-draft-charts/delete-draft-charts-request';
import {
  type ToBackendDeleteDraftChartsResponse,
  zToBackendDeleteDraftChartsResponse
} from '#common/types/backend/routes/charts/delete-draft-charts/delete-draft-charts-response';
import {
  type ToBackendEditDraftChartRequest,
  zToBackendEditDraftChartRequest
} from '#common/types/backend/routes/charts/edit-draft-chart/edit-draft-chart-request';
import {
  type ToBackendEditDraftChartResponse,
  zToBackendEditDraftChartResponse
} from '#common/types/backend/routes/charts/edit-draft-chart/edit-draft-chart-response';
import {
  type ToBackendGetChartRequest,
  zToBackendGetChartRequest
} from '#common/types/backend/routes/charts/get-chart/get-chart-request';
import {
  type ToBackendGetChartResponse,
  zToBackendGetChartResponse
} from '#common/types/backend/routes/charts/get-chart/get-chart-response';
import {
  type ToBackendGetChartsRequest,
  zToBackendGetChartsRequest
} from '#common/types/backend/routes/charts/get-charts/get-charts-request';
import {
  type ToBackendGetChartsResponse,
  zToBackendGetChartsResponse
} from '#common/types/backend/routes/charts/get-charts/get-charts-response';
import {
  type ToBackendGetExplorerChartTabRequest,
  zToBackendGetExplorerChartTabRequest
} from '#common/types/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-request';
import {
  type ToBackendGetExplorerChartTabResponse,
  zToBackendGetExplorerChartTabResponse
} from '#common/types/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-response';
import {
  type ToBackendProduceExplorerChartRequest,
  zToBackendProduceExplorerChartRequest
} from '#common/types/backend/routes/charts/produce-explorer-chart/produce-explorer-chart-request';
import {
  type ToBackendProduceExplorerChartResponse,
  zToBackendProduceExplorerChartResponse
} from '#common/types/backend/routes/charts/produce-explorer-chart/produce-explorer-chart-response';
import {
  type ToBackendSaveCreateChartRequest,
  zToBackendSaveCreateChartRequest
} from '#common/types/backend/routes/charts/save-create-chart/save-create-chart-request';
import {
  type ToBackendSaveCreateChartResponse,
  zToBackendSaveCreateChartResponse
} from '#common/types/backend/routes/charts/save-create-chart/save-create-chart-response';
import {
  type ToBackendSaveModifyChartRequest,
  zToBackendSaveModifyChartRequest
} from '#common/types/backend/routes/charts/save-modify-chart/save-modify-chart-request';
import {
  type ToBackendSaveModifyChartResponse,
  zToBackendSaveModifyChartResponse
} from '#common/types/backend/routes/charts/save-modify-chart/save-modify-chart-response';
import {
  type ToBackendCheckSignUpRequest,
  zToBackendCheckSignUpRequest
} from '#common/types/backend/routes/check/check-sign-up/check-sign-up-request';
import {
  type ToBackendCheckSignUpResponse,
  zToBackendCheckSignUpResponse
} from '#common/types/backend/routes/check/check-sign-up/check-sign-up-response';
import {
  type ToBackendClearCachedColumnRequest,
  zToBackendClearCachedColumnRequest
} from '#common/types/backend/routes/connections/clear-cached-column/clear-cached-column-request';
import {
  type ToBackendClearCachedColumnResponse,
  zToBackendClearCachedColumnResponse
} from '#common/types/backend/routes/connections/clear-cached-column/clear-cached-column-response';
import {
  type ToBackendCreateConnectionRequest,
  zToBackendCreateConnectionRequest
} from '#common/types/backend/routes/connections/create-connection/create-connection-request';
import {
  type ToBackendCreateConnectionResponse,
  zToBackendCreateConnectionResponse
} from '#common/types/backend/routes/connections/create-connection/create-connection-response';
import {
  type ToBackendDeleteConnectionRequest,
  zToBackendDeleteConnectionRequest
} from '#common/types/backend/routes/connections/delete-connection/delete-connection-request';
import {
  type ToBackendDeleteConnectionResponse,
  zToBackendDeleteConnectionResponse
} from '#common/types/backend/routes/connections/delete-connection/delete-connection-response';
import {
  type ToBackendEditConnectionRequest,
  zToBackendEditConnectionRequest
} from '#common/types/backend/routes/connections/edit-connection/edit-connection-request';
import {
  type ToBackendEditConnectionResponse,
  zToBackendEditConnectionResponse
} from '#common/types/backend/routes/connections/edit-connection/edit-connection-response';
import {
  type ToBackendGetCachedColumnsRequest,
  zToBackendGetCachedColumnsRequest
} from '#common/types/backend/routes/connections/get-cached-columns/get-cached-columns-request';
import {
  type ToBackendGetCachedColumnsResponse,
  zToBackendGetCachedColumnsResponse
} from '#common/types/backend/routes/connections/get-cached-columns/get-cached-columns-response';
import {
  type ToBackendGetConnectionSampleRequest,
  zToBackendGetConnectionSampleRequest
} from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-request';
import {
  type ToBackendGetConnectionSampleResponse,
  zToBackendGetConnectionSampleResponse
} from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-response';
import {
  type ToBackendGetConnectionSchemasRequest,
  zToBackendGetConnectionSchemasRequest
} from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-request';
import {
  type ToBackendGetConnectionSchemasResponse,
  zToBackendGetConnectionSchemasResponse
} from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-response';
import {
  type ToBackendGetConnectionsRequest,
  zToBackendGetConnectionsRequest
} from '#common/types/backend/routes/connections/get-connections/get-connections-request';
import {
  type ToBackendGetConnectionsResponse,
  zToBackendGetConnectionsResponse
} from '#common/types/backend/routes/connections/get-connections/get-connections-response';
import {
  type ToBackendGetConnectionsListRequest,
  zToBackendGetConnectionsListRequest
} from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-request';
import {
  type ToBackendGetConnectionsListResponse,
  zToBackendGetConnectionsListResponse
} from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-response';
import {
  type ToBackendRefreshCachedColumnRequest,
  zToBackendRefreshCachedColumnRequest
} from '#common/types/backend/routes/connections/refresh-cached-column/refresh-cached-column-request';
import {
  type ToBackendRefreshCachedColumnResponse,
  zToBackendRefreshCachedColumnResponse
} from '#common/types/backend/routes/connections/refresh-cached-column/refresh-cached-column-response';
import {
  type ToBackendTestConnectionRequest,
  zToBackendTestConnectionRequest
} from '#common/types/backend/routes/connections/test-connection/test-connection-request';
import {
  type ToBackendTestConnectionResponse,
  zToBackendTestConnectionResponse
} from '#common/types/backend/routes/connections/test-connection/test-connection-response';
import {
  type ToBackendViewCachedColumnRequest,
  zToBackendViewCachedColumnRequest
} from '#common/types/backend/routes/connections/view-cached-column/view-cached-column-request';
import {
  type ToBackendViewCachedColumnResponse,
  zToBackendViewCachedColumnResponse
} from '#common/types/backend/routes/connections/view-cached-column/view-cached-column-response';
import {
  type ToBackendCreateDraftDashboardRequest,
  zToBackendCreateDraftDashboardRequest
} from '#common/types/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-request';
import {
  type ToBackendCreateDraftDashboardResponse,
  zToBackendCreateDraftDashboardResponse
} from '#common/types/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-response';
import {
  type ToBackendDeleteDashboardRequest,
  zToBackendDeleteDashboardRequest
} from '#common/types/backend/routes/dashboards/delete-dashboard/delete-dashboard-request';
import {
  type ToBackendDeleteDashboardResponse,
  zToBackendDeleteDashboardResponse
} from '#common/types/backend/routes/dashboards/delete-dashboard/delete-dashboard-response';
import {
  type ToBackendDeleteDraftDashboardsRequest,
  zToBackendDeleteDraftDashboardsRequest
} from '#common/types/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-request';
import {
  type ToBackendDeleteDraftDashboardsResponse,
  zToBackendDeleteDraftDashboardsResponse
} from '#common/types/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-response';
import {
  type ToBackendEditDraftDashboardRequest,
  zToBackendEditDraftDashboardRequest
} from '#common/types/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-request';
import {
  type ToBackendEditDraftDashboardResponse,
  zToBackendEditDraftDashboardResponse
} from '#common/types/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-response';
import {
  type ToBackendGetDashboardRequest,
  zToBackendGetDashboardRequest
} from '#common/types/backend/routes/dashboards/get-dashboard/get-dashboard-request';
import {
  type ToBackendGetDashboardResponse,
  zToBackendGetDashboardResponse
} from '#common/types/backend/routes/dashboards/get-dashboard/get-dashboard-response';
import {
  type ToBackendGetDashboardsRequest,
  zToBackendGetDashboardsRequest
} from '#common/types/backend/routes/dashboards/get-dashboards/get-dashboards-request';
import {
  type ToBackendGetDashboardsResponse,
  zToBackendGetDashboardsResponse
} from '#common/types/backend/routes/dashboards/get-dashboards/get-dashboards-response';
import {
  type ToBackendSaveCreateDashboardRequest,
  zToBackendSaveCreateDashboardRequest
} from '#common/types/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-request';
import {
  type ToBackendSaveCreateDashboardResponse,
  zToBackendSaveCreateDashboardResponse
} from '#common/types/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-response';
import {
  type ToBackendSaveModifyDashboardRequest,
  zToBackendSaveModifyDashboardRequest
} from '#common/types/backend/routes/dashboards/save-modify-dashboard/save-modify-dashboard-request';
import {
  type ToBackendSaveModifyDashboardResponse,
  zToBackendSaveModifyDashboardResponse
} from '#common/types/backend/routes/dashboards/save-modify-dashboard/save-modify-dashboard-response';
import {
  type ToBackendCreateEnvRequest,
  zToBackendCreateEnvRequest
} from '#common/types/backend/routes/envs/create-env/create-env-request';
import {
  type ToBackendCreateEnvResponse,
  zToBackendCreateEnvResponse
} from '#common/types/backend/routes/envs/create-env/create-env-response';
import {
  type ToBackendCreateEnvUserRequest,
  zToBackendCreateEnvUserRequest
} from '#common/types/backend/routes/envs/create-env-user/create-env-user-request';
import {
  type ToBackendCreateEnvUserResponse,
  zToBackendCreateEnvUserResponse
} from '#common/types/backend/routes/envs/create-env-user/create-env-user-response';
import {
  type ToBackendCreateEnvVarRequest,
  zToBackendCreateEnvVarRequest
} from '#common/types/backend/routes/envs/create-env-var/create-env-var-request';
import {
  type ToBackendCreateEnvVarResponse,
  zToBackendCreateEnvVarResponse
} from '#common/types/backend/routes/envs/create-env-var/create-env-var-response';
import {
  type ToBackendDeleteEnvRequest,
  zToBackendDeleteEnvRequest
} from '#common/types/backend/routes/envs/delete-env/delete-env-request';
import {
  type ToBackendDeleteEnvResponse,
  zToBackendDeleteEnvResponse
} from '#common/types/backend/routes/envs/delete-env/delete-env-response';
import {
  type ToBackendDeleteEnvUserRequest,
  zToBackendDeleteEnvUserRequest
} from '#common/types/backend/routes/envs/delete-env-user/delete-env-user-request';
import {
  type ToBackendDeleteEnvUserResponse,
  zToBackendDeleteEnvUserResponse
} from '#common/types/backend/routes/envs/delete-env-user/delete-env-user-response';
import {
  type ToBackendDeleteEnvVarRequest,
  zToBackendDeleteEnvVarRequest
} from '#common/types/backend/routes/envs/delete-env-var/delete-env-var-request';
import {
  type ToBackendDeleteEnvVarResponse,
  zToBackendDeleteEnvVarResponse
} from '#common/types/backend/routes/envs/delete-env-var/delete-env-var-response';
import {
  type ToBackendEditEnvFallbacksRequest,
  zToBackendEditEnvFallbacksRequest
} from '#common/types/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-request';
import {
  type ToBackendEditEnvFallbacksResponse,
  zToBackendEditEnvFallbacksResponse
} from '#common/types/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-response';
import {
  type ToBackendEditEnvVarRequest,
  zToBackendEditEnvVarRequest
} from '#common/types/backend/routes/envs/edit-env-var/edit-env-var-request';
import {
  type ToBackendEditEnvVarResponse,
  zToBackendEditEnvVarResponse
} from '#common/types/backend/routes/envs/edit-env-var/edit-env-var-response';
import {
  type ToBackendGetEnvsRequest,
  zToBackendGetEnvsRequest
} from '#common/types/backend/routes/envs/get-envs/get-envs-request';
import {
  type ToBackendGetEnvsResponse,
  zToBackendGetEnvsResponse
} from '#common/types/backend/routes/envs/get-envs/get-envs-response';
import {
  type ToBackendGetEnvsListRequest,
  zToBackendGetEnvsListRequest
} from '#common/types/backend/routes/envs/get-envs-list/get-envs-list-request';
import {
  type ToBackendGetEnvsListResponse,
  zToBackendGetEnvsListResponse
} from '#common/types/backend/routes/envs/get-envs-list/get-envs-list-response';
import {
  type ToBackendSetFavoriteRequest,
  zToBackendSetFavoriteRequest
} from '#common/types/backend/routes/favorites/set-favorite/set-favorite-request';
import {
  type ToBackendSetFavoriteResponse,
  zToBackendSetFavoriteResponse
} from '#common/types/backend/routes/favorites/set-favorite/set-favorite-response';
import {
  type ToBackendCreateFileRequest,
  zToBackendCreateFileRequest
} from '#common/types/backend/routes/files/create-file/create-file-request';
import {
  type ToBackendCreateFileResponse,
  zToBackendCreateFileResponse
} from '#common/types/backend/routes/files/create-file/create-file-response';
import {
  type ToBackendDeleteFileRequest,
  zToBackendDeleteFileRequest
} from '#common/types/backend/routes/files/delete-file/delete-file-request';
import {
  type ToBackendDeleteFileResponse,
  zToBackendDeleteFileResponse
} from '#common/types/backend/routes/files/delete-file/delete-file-response';
import {
  type ToBackendGetFileRequest,
  zToBackendGetFileRequest
} from '#common/types/backend/routes/files/get-file/get-file-request';
import {
  type ToBackendGetFileResponse,
  zToBackendGetFileResponse
} from '#common/types/backend/routes/files/get-file/get-file-response';
import {
  type ToBackendSaveFileRequest,
  zToBackendSaveFileRequest
} from '#common/types/backend/routes/files/save-file/save-file-request';
import {
  type ToBackendSaveFileResponse,
  zToBackendSaveFileResponse
} from '#common/types/backend/routes/files/save-file/save-file-response';
import {
  type ToBackendValidateFilesRequest,
  zToBackendValidateFilesRequest
} from '#common/types/backend/routes/files/validate-files/validate-files-request';
import {
  type ToBackendValidateFilesResponse,
  zToBackendValidateFilesResponse
} from '#common/types/backend/routes/files/validate-files/validate-files-response';
import {
  type ToBackendCreateFolderRequest,
  zToBackendCreateFolderRequest
} from '#common/types/backend/routes/folders/create-folder/create-folder-request';
import {
  type ToBackendCreateFolderResponse,
  zToBackendCreateFolderResponse
} from '#common/types/backend/routes/folders/create-folder/create-folder-response';
import {
  type ToBackendDeleteFolderRequest,
  zToBackendDeleteFolderRequest
} from '#common/types/backend/routes/folders/delete-folder/delete-folder-request';
import {
  type ToBackendDeleteFolderResponse,
  zToBackendDeleteFolderResponse
} from '#common/types/backend/routes/folders/delete-folder/delete-folder-response';
import {
  type ToBackendCreateGivenRequest,
  zToBackendCreateGivenRequest
} from '#common/types/backend/routes/givens/create-given/create-given-request';
import {
  type ToBackendCreateGivenResponse,
  zToBackendCreateGivenResponse
} from '#common/types/backend/routes/givens/create-given/create-given-response';
import {
  type ToBackendDeleteGivenRequest,
  zToBackendDeleteGivenRequest
} from '#common/types/backend/routes/givens/delete-given/delete-given-request';
import {
  type ToBackendDeleteGivenResponse,
  zToBackendDeleteGivenResponse
} from '#common/types/backend/routes/givens/delete-given/delete-given-response';
import {
  type ToBackendEditGivenRequest,
  zToBackendEditGivenRequest
} from '#common/types/backend/routes/givens/edit-given/edit-given-request';
import {
  type ToBackendEditGivenResponse,
  zToBackendEditGivenResponse
} from '#common/types/backend/routes/givens/edit-given/edit-given-response';
import {
  type ToBackendGetGivensRequest,
  zToBackendGetGivensRequest
} from '#common/types/backend/routes/givens/get-givens/get-givens-request';
import {
  type ToBackendGetGivensResponse,
  zToBackendGetGivensResponse
} from '#common/types/backend/routes/givens/get-givens/get-givens-response';
import {
  type ToBackendCreateLlmModelRequest,
  zToBackendCreateLlmModelRequest
} from '#common/types/backend/routes/llm-models/create-llm-model/create-llm-model-request';
import {
  type ToBackendCreateLlmModelResponse,
  zToBackendCreateLlmModelResponse
} from '#common/types/backend/routes/llm-models/create-llm-model/create-llm-model-response';
import {
  type ToBackendDeleteLlmModelRequest,
  zToBackendDeleteLlmModelRequest
} from '#common/types/backend/routes/llm-models/delete-llm-model/delete-llm-model-request';
import {
  type ToBackendDeleteLlmModelResponse,
  zToBackendDeleteLlmModelResponse
} from '#common/types/backend/routes/llm-models/delete-llm-model/delete-llm-model-response';
import {
  type ToBackendEditLlmModelRequest,
  zToBackendEditLlmModelRequest
} from '#common/types/backend/routes/llm-models/edit-llm-model/edit-llm-model-request';
import {
  type ToBackendEditLlmModelResponse,
  zToBackendEditLlmModelResponse
} from '#common/types/backend/routes/llm-models/edit-llm-model/edit-llm-model-response';
import {
  type ToBackendGetLlmModelPartsRequest,
  zToBackendGetLlmModelPartsRequest
} from '#common/types/backend/routes/llm-models/get-llm-model-parts/get-llm-model-parts-request';
import {
  type ToBackendGetLlmModelPartsResponse,
  zToBackendGetLlmModelPartsResponse
} from '#common/types/backend/routes/llm-models/get-llm-model-parts/get-llm-model-parts-response';
import {
  type ToBackendGetLlmModelsWithProviderRequest,
  zToBackendGetLlmModelsWithProviderRequest
} from '#common/types/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-request';
import {
  type ToBackendGetLlmModelsWithProviderResponse,
  zToBackendGetLlmModelsWithProviderResponse
} from '#common/types/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-response';
import {
  type ToBackendDuplicateMconfigAndQueryRequest,
  zToBackendDuplicateMconfigAndQueryRequest
} from '#common/types/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-request';
import {
  type ToBackendDuplicateMconfigAndQueryResponse,
  zToBackendDuplicateMconfigAndQueryResponse
} from '#common/types/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-response';
import {
  type ToBackendGroupMetricByDimensionRequest,
  zToBackendGroupMetricByDimensionRequest
} from '#common/types/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-request';
import {
  type ToBackendGroupMetricByDimensionResponse,
  zToBackendGroupMetricByDimensionResponse
} from '#common/types/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-response';
import {
  type ToBackendSuggestDimensionValuesRequest,
  zToBackendSuggestDimensionValuesRequest
} from '#common/types/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-request';
import {
  type ToBackendSuggestDimensionValuesResponse,
  zToBackendSuggestDimensionValuesResponse
} from '#common/types/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-response';
import {
  type ToBackendCreateMemberRequest,
  zToBackendCreateMemberRequest
} from '#common/types/backend/routes/members/create-member/create-member-request';
import {
  type ToBackendCreateMemberResponse,
  zToBackendCreateMemberResponse
} from '#common/types/backend/routes/members/create-member/create-member-response';
import {
  type ToBackendDeleteMemberRequest,
  zToBackendDeleteMemberRequest
} from '#common/types/backend/routes/members/delete-member/delete-member-request';
import {
  type ToBackendDeleteMemberResponse,
  zToBackendDeleteMemberResponse
} from '#common/types/backend/routes/members/delete-member/delete-member-response';
import {
  type ToBackendEditMemberRequest,
  zToBackendEditMemberRequest
} from '#common/types/backend/routes/members/edit-member/edit-member-request';
import {
  type ToBackendEditMemberResponse,
  zToBackendEditMemberResponse
} from '#common/types/backend/routes/members/edit-member/edit-member-response';
import {
  type ToBackendGetMemberGivensRequest,
  zToBackendGetMemberGivensRequest
} from '#common/types/backend/routes/members/get-member-givens/get-member-givens-request';
import {
  type ToBackendGetMemberGivensResponse,
  zToBackendGetMemberGivensResponse
} from '#common/types/backend/routes/members/get-member-givens/get-member-givens-response';
import {
  type ToBackendGetMembersRequest,
  zToBackendGetMembersRequest
} from '#common/types/backend/routes/members/get-members/get-members-request';
import {
  type ToBackendGetMembersResponse,
  zToBackendGetMembersResponse
} from '#common/types/backend/routes/members/get-members/get-members-response';
import {
  type ToBackendGetMembersListRequest,
  zToBackendGetMembersListRequest
} from '#common/types/backend/routes/members/get-members-list/get-members-list-request';
import {
  type ToBackendGetMembersListResponse,
  zToBackendGetMembersListResponse
} from '#common/types/backend/routes/members/get-members-list/get-members-list-response';
import {
  type ToBackendGetModelRequest,
  zToBackendGetModelRequest
} from '#common/types/backend/routes/models/get-model/get-model-request';
import {
  type ToBackendGetModelResponse,
  zToBackendGetModelResponse
} from '#common/types/backend/routes/models/get-model/get-model-response';
import {
  type ToBackendGetModelsRequest,
  zToBackendGetModelsRequest
} from '#common/types/backend/routes/models/get-models/get-models-request';
import {
  type ToBackendGetModelsResponse,
  zToBackendGetModelsResponse
} from '#common/types/backend/routes/models/get-models/get-models-response';
import {
  type ToBackendCheckLastNavRequest,
  zToBackendCheckLastNavRequest
} from '#common/types/backend/routes/nav/check-last-nav/check-last-nav-request';
import {
  type ToBackendCheckLastNavResponse,
  zToBackendCheckLastNavResponse
} from '#common/types/backend/routes/nav/check-last-nav/check-last-nav-response';
import {
  type ToBackendGetNavRequest,
  zToBackendGetNavRequest
} from '#common/types/backend/routes/nav/get-nav/get-nav-request';
import {
  type ToBackendGetNavResponse,
  zToBackendGetNavResponse
} from '#common/types/backend/routes/nav/get-nav/get-nav-response';
import {
  type ToBackendGetOrgUsersRequest,
  zToBackendGetOrgUsersRequest
} from '#common/types/backend/routes/org-users/get-org-users/get-org-users-request';
import {
  type ToBackendGetOrgUsersResponse,
  zToBackendGetOrgUsersResponse
} from '#common/types/backend/routes/org-users/get-org-users/get-org-users-response';
import {
  type ToBackendCreateOrgRequest,
  zToBackendCreateOrgRequest
} from '#common/types/backend/routes/orgs/create-org/create-org-request';
import {
  type ToBackendCreateOrgResponse,
  zToBackendCreateOrgResponse
} from '#common/types/backend/routes/orgs/create-org/create-org-response';
import {
  type ToBackendDeleteOrgRequest,
  zToBackendDeleteOrgRequest
} from '#common/types/backend/routes/orgs/delete-org/delete-org-request';
import {
  type ToBackendDeleteOrgResponse,
  zToBackendDeleteOrgResponse
} from '#common/types/backend/routes/orgs/delete-org/delete-org-response';
import {
  type ToBackendGetOrgRequest,
  zToBackendGetOrgRequest
} from '#common/types/backend/routes/orgs/get-org/get-org-request';
import {
  type ToBackendGetOrgResponse,
  zToBackendGetOrgResponse
} from '#common/types/backend/routes/orgs/get-org/get-org-response';
import {
  type ToBackendGetOrgsListRequest,
  zToBackendGetOrgsListRequest
} from '#common/types/backend/routes/orgs/get-orgs-list/get-orgs-list-request';
import {
  type ToBackendGetOrgsListResponse,
  zToBackendGetOrgsListResponse
} from '#common/types/backend/routes/orgs/get-orgs-list/get-orgs-list-response';
import {
  type ToBackendIsOrgExistRequest,
  zToBackendIsOrgExistRequest
} from '#common/types/backend/routes/orgs/is-org-exist/is-org-exist-request';
import {
  type ToBackendIsOrgExistResponse,
  zToBackendIsOrgExistResponse
} from '#common/types/backend/routes/orgs/is-org-exist/is-org-exist-response';
import {
  type ToBackendSetOrgInfoRequest,
  zToBackendSetOrgInfoRequest
} from '#common/types/backend/routes/orgs/set-org-info/set-org-info-request';
import {
  type ToBackendSetOrgInfoResponse,
  zToBackendSetOrgInfoResponse
} from '#common/types/backend/routes/orgs/set-org-info/set-org-info-response';
import {
  type ToBackendSetOrgOwnerRequest,
  zToBackendSetOrgOwnerRequest
} from '#common/types/backend/routes/orgs/set-org-owner/set-org-owner-request';
import {
  type ToBackendSetOrgOwnerResponse,
  zToBackendSetOrgOwnerResponse
} from '#common/types/backend/routes/orgs/set-org-owner/set-org-owner-response';
import {
  type ToBackendCreateProjectRequest,
  zToBackendCreateProjectRequest
} from '#common/types/backend/routes/projects/create-project/create-project-request';
import {
  type ToBackendCreateProjectResponse,
  zToBackendCreateProjectResponse
} from '#common/types/backend/routes/projects/create-project/create-project-response';
import {
  type ToBackendDeleteProjectRequest,
  zToBackendDeleteProjectRequest
} from '#common/types/backend/routes/projects/delete-project/delete-project-request';
import {
  type ToBackendDeleteProjectResponse,
  zToBackendDeleteProjectResponse
} from '#common/types/backend/routes/projects/delete-project/delete-project-response';
import {
  type ToBackendGenerateProjectRemoteKeyRequest,
  zToBackendGenerateProjectRemoteKeyRequest
} from '#common/types/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-request';
import {
  type ToBackendGenerateProjectRemoteKeyResponse,
  zToBackendGenerateProjectRemoteKeyResponse
} from '#common/types/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-response';
import {
  type ToBackendGetProjectRequest,
  zToBackendGetProjectRequest
} from '#common/types/backend/routes/projects/get-project/get-project-request';
import {
  type ToBackendGetProjectResponse,
  zToBackendGetProjectResponse
} from '#common/types/backend/routes/projects/get-project/get-project-response';
import {
  type ToBackendGetProjectsListRequest,
  zToBackendGetProjectsListRequest
} from '#common/types/backend/routes/projects/get-projects-list/get-projects-list-request';
import {
  type ToBackendGetProjectsListResponse,
  zToBackendGetProjectsListResponse
} from '#common/types/backend/routes/projects/get-projects-list/get-projects-list-response';
import {
  type ToBackendIsProjectExistRequest,
  zToBackendIsProjectExistRequest
} from '#common/types/backend/routes/projects/is-project-exist/is-project-exist-request';
import {
  type ToBackendIsProjectExistResponse,
  zToBackendIsProjectExistResponse
} from '#common/types/backend/routes/projects/is-project-exist/is-project-exist-response';
import {
  type ToBackendSetProjectAllowTimezonesRequest,
  zToBackendSetProjectAllowTimezonesRequest
} from '#common/types/backend/routes/projects/set-project-allow-timezones/set-project-allow-timezones-request';
import {
  type ToBackendSetProjectAllowTimezonesResponse,
  zToBackendSetProjectAllowTimezonesResponse
} from '#common/types/backend/routes/projects/set-project-allow-timezones/set-project-allow-timezones-response';
import {
  type ToBackendSetProjectInfoRequest,
  zToBackendSetProjectInfoRequest
} from '#common/types/backend/routes/projects/set-project-info/set-project-info-request';
import {
  type ToBackendSetProjectInfoResponse,
  zToBackendSetProjectInfoResponse
} from '#common/types/backend/routes/projects/set-project-info/set-project-info-response';
import {
  type ToBackendSetProjectSandboxProviderRequest,
  zToBackendSetProjectSandboxProviderRequest
} from '#common/types/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-request';
import {
  type ToBackendSetProjectSandboxProviderResponse,
  zToBackendSetProjectSandboxProviderResponse
} from '#common/types/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-response';
import {
  type ToBackendSetProjectTimezoneRequest,
  zToBackendSetProjectTimezoneRequest
} from '#common/types/backend/routes/projects/set-project-timezone/set-project-timezone-request';
import {
  type ToBackendSetProjectTimezoneResponse,
  zToBackendSetProjectTimezoneResponse
} from '#common/types/backend/routes/projects/set-project-timezone/set-project-timezone-response';
import {
  type ToBackendSetProjectWeekStartRequest,
  zToBackendSetProjectWeekStartRequest
} from '#common/types/backend/routes/projects/set-project-week-start/set-project-week-start-request';
import {
  type ToBackendSetProjectWeekStartResponse,
  zToBackendSetProjectWeekStartResponse
} from '#common/types/backend/routes/projects/set-project-week-start/set-project-week-start-response';
import {
  type ToBackendCreateProviderRequest,
  zToBackendCreateProviderRequest
} from '#common/types/backend/routes/providers/create-provider/create-provider-request';
import {
  type ToBackendCreateProviderResponse,
  zToBackendCreateProviderResponse
} from '#common/types/backend/routes/providers/create-provider/create-provider-response';
import {
  type ToBackendDeleteProviderRequest,
  zToBackendDeleteProviderRequest
} from '#common/types/backend/routes/providers/delete-provider/delete-provider-request';
import {
  type ToBackendDeleteProviderResponse,
  zToBackendDeleteProviderResponse
} from '#common/types/backend/routes/providers/delete-provider/delete-provider-response';
import {
  type ToBackendEditProviderRequest,
  zToBackendEditProviderRequest
} from '#common/types/backend/routes/providers/edit-provider/edit-provider-request';
import {
  type ToBackendEditProviderResponse,
  zToBackendEditProviderResponse
} from '#common/types/backend/routes/providers/edit-provider/edit-provider-response';
import {
  type ToBackendGetProvidersRequest,
  zToBackendGetProvidersRequest
} from '#common/types/backend/routes/providers/get-providers/get-providers-request';
import {
  type ToBackendGetProvidersResponse,
  zToBackendGetProvidersResponse
} from '#common/types/backend/routes/providers/get-providers/get-providers-response';
import {
  type ToBackendToggleProviderRequest,
  zToBackendToggleProviderRequest
} from '#common/types/backend/routes/providers/toggle-provider/toggle-provider-request';
import {
  type ToBackendToggleProviderResponse,
  zToBackendToggleProviderResponse
} from '#common/types/backend/routes/providers/toggle-provider/toggle-provider-response';
import {
  type ToBackendCancelQueriesRequest,
  zToBackendCancelQueriesRequest
} from '#common/types/backend/routes/queries/cancel-queries/cancel-queries-request';
import {
  type ToBackendCancelQueriesResponse,
  zToBackendCancelQueriesResponse
} from '#common/types/backend/routes/queries/cancel-queries/cancel-queries-response';
import {
  type ToBackendGetQueriesRequest,
  zToBackendGetQueriesRequest
} from '#common/types/backend/routes/queries/get-queries/get-queries-request';
import {
  type ToBackendGetQueriesResponse,
  zToBackendGetQueriesResponse
} from '#common/types/backend/routes/queries/get-queries/get-queries-response';
import {
  type ToBackendGetQueryRequest,
  zToBackendGetQueryRequest
} from '#common/types/backend/routes/queries/get-query/get-query-request';
import {
  type ToBackendGetQueryResponse,
  zToBackendGetQueryResponse
} from '#common/types/backend/routes/queries/get-query/get-query-response';
import {
  type ToBackendRunQueriesRequest,
  zToBackendRunQueriesRequest
} from '#common/types/backend/routes/queries/run-queries/run-queries-request';
import {
  type ToBackendRunQueriesResponse,
  zToBackendRunQueriesResponse
} from '#common/types/backend/routes/queries/run-queries/run-queries-response';
import {
  type ToBackendRunQueriesDryRequest,
  zToBackendRunQueriesDryRequest
} from '#common/types/backend/routes/queries/run-queries-dry/run-queries-dry-request';
import {
  type ToBackendRunQueriesDryResponse,
  zToBackendRunQueriesDryResponse
} from '#common/types/backend/routes/queries/run-queries-dry/run-queries-dry-response';
import {
  type ToBackendGetQueryInfoRequest,
  zToBackendGetQueryInfoRequest
} from '#common/types/backend/routes/query-info/get-query-info/get-query-info-request';
import {
  type ToBackendGetQueryInfoResponse,
  zToBackendGetQueryInfoResponse
} from '#common/types/backend/routes/query-info/get-query-info/get-query-info-response';
import {
  type ToBackendCreateDraftReportRequest,
  zToBackendCreateDraftReportRequest
} from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-request';
import {
  type ToBackendCreateDraftReportResponse,
  zToBackendCreateDraftReportResponse
} from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-response';
import {
  type ToBackendDeleteDraftReportsRequest,
  zToBackendDeleteDraftReportsRequest
} from '#common/types/backend/routes/reports/delete-draft-reports/delete-draft-reports-request';
import {
  type ToBackendDeleteDraftReportsResponse,
  zToBackendDeleteDraftReportsResponse
} from '#common/types/backend/routes/reports/delete-draft-reports/delete-draft-reports-response';
import {
  type ToBackendDeleteReportRequest,
  zToBackendDeleteReportRequest
} from '#common/types/backend/routes/reports/delete-report/delete-report-request';
import {
  type ToBackendDeleteReportResponse,
  zToBackendDeleteReportResponse
} from '#common/types/backend/routes/reports/delete-report/delete-report-response';
import {
  type ToBackendEditDraftReportRequest,
  zToBackendEditDraftReportRequest
} from '#common/types/backend/routes/reports/edit-draft-report/edit-draft-report-request';
import {
  type ToBackendEditDraftReportResponse,
  zToBackendEditDraftReportResponse
} from '#common/types/backend/routes/reports/edit-draft-report/edit-draft-report-response';
import {
  type ToBackendGetReportRequest,
  zToBackendGetReportRequest
} from '#common/types/backend/routes/reports/get-report/get-report-request';
import {
  type ToBackendGetReportResponse,
  zToBackendGetReportResponse
} from '#common/types/backend/routes/reports/get-report/get-report-response';
import {
  type ToBackendGetReportsRequest,
  zToBackendGetReportsRequest
} from '#common/types/backend/routes/reports/get-reports/get-reports-request';
import {
  type ToBackendGetReportsResponse,
  zToBackendGetReportsResponse
} from '#common/types/backend/routes/reports/get-reports/get-reports-response';
import {
  type ToBackendSaveCreateReportRequest,
  zToBackendSaveCreateReportRequest
} from '#common/types/backend/routes/reports/save-create-report/save-create-report-request';
import {
  type ToBackendSaveCreateReportResponse,
  zToBackendSaveCreateReportResponse
} from '#common/types/backend/routes/reports/save-create-report/save-create-report-response';
import {
  type ToBackendSaveModifyReportRequest,
  zToBackendSaveModifyReportRequest
} from '#common/types/backend/routes/reports/save-modify-report/save-modify-report-request';
import {
  type ToBackendSaveModifyReportResponse,
  zToBackendSaveModifyReportResponse
} from '#common/types/backend/routes/reports/save-modify-report/save-modify-report-response';
import {
  type ToBackendCommitRepoRequest,
  zToBackendCommitRepoRequest
} from '#common/types/backend/routes/repos/commit-repo/commit-repo-request';
import {
  type ToBackendCommitRepoResponse,
  zToBackendCommitRepoResponse
} from '#common/types/backend/routes/repos/commit-repo/commit-repo-response';
import {
  type ToBackendGetRepoRequest,
  zToBackendGetRepoRequest
} from '#common/types/backend/routes/repos/get-repo/get-repo-request';
import {
  type ToBackendGetRepoResponse,
  zToBackendGetRepoResponse
} from '#common/types/backend/routes/repos/get-repo/get-repo-response';
import {
  type ToBackendMergeRepoRequest,
  zToBackendMergeRepoRequest
} from '#common/types/backend/routes/repos/merge-repo/merge-repo-request';
import {
  type ToBackendMergeRepoResponse,
  zToBackendMergeRepoResponse
} from '#common/types/backend/routes/repos/merge-repo/merge-repo-response';
import {
  type ToBackendPullRepoRequest,
  zToBackendPullRepoRequest
} from '#common/types/backend/routes/repos/pull-repo/pull-repo-request';
import {
  type ToBackendPullRepoResponse,
  zToBackendPullRepoResponse
} from '#common/types/backend/routes/repos/pull-repo/pull-repo-response';
import {
  type ToBackendPushRepoRequest,
  zToBackendPushRepoRequest
} from '#common/types/backend/routes/repos/push-repo/push-repo-request';
import {
  type ToBackendPushRepoResponse,
  zToBackendPushRepoResponse
} from '#common/types/backend/routes/repos/push-repo/push-repo-response';
import {
  type ToBackendRevertRepoToLastCommitRequest,
  zToBackendRevertRepoToLastCommitRequest
} from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import {
  type ToBackendRevertRepoToLastCommitResponse,
  zToBackendRevertRepoToLastCommitResponse
} from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';
import {
  type ToBackendRevertRepoToRemoteRequest,
  zToBackendRevertRepoToRemoteRequest
} from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-request';
import {
  type ToBackendRevertRepoToRemoteResponse,
  zToBackendRevertRepoToRemoteResponse
} from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-response';
import {
  type ToBackendSyncRepoRequest,
  zToBackendSyncRepoRequest
} from '#common/types/backend/routes/repos/sync-repo/sync-repo-request';
import {
  type ToBackendSyncRepoResponse,
  zToBackendSyncRepoResponse
} from '#common/types/backend/routes/repos/sync-repo/sync-repo-response';
import {
  type ToBackendCreateRoleRequest,
  zToBackendCreateRoleRequest
} from '#common/types/backend/routes/roles/create-role/create-role-request';
import {
  type ToBackendCreateRoleResponse,
  zToBackendCreateRoleResponse
} from '#common/types/backend/routes/roles/create-role/create-role-response';
import {
  type ToBackendCreateRoleGivenRequest,
  zToBackendCreateRoleGivenRequest
} from '#common/types/backend/routes/roles/create-role-given/create-role-given-request';
import {
  type ToBackendCreateRoleGivenResponse,
  zToBackendCreateRoleGivenResponse
} from '#common/types/backend/routes/roles/create-role-given/create-role-given-response';
import {
  type ToBackendDeleteRoleRequest,
  zToBackendDeleteRoleRequest
} from '#common/types/backend/routes/roles/delete-role/delete-role-request';
import {
  type ToBackendDeleteRoleResponse,
  zToBackendDeleteRoleResponse
} from '#common/types/backend/routes/roles/delete-role/delete-role-response';
import {
  type ToBackendDeleteRoleGivenRequest,
  zToBackendDeleteRoleGivenRequest
} from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-request';
import {
  type ToBackendDeleteRoleGivenResponse,
  zToBackendDeleteRoleGivenResponse
} from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-response';
import {
  type ToBackendEditRoleGivenRequest,
  zToBackendEditRoleGivenRequest
} from '#common/types/backend/routes/roles/edit-role-given/edit-role-given-request';
import {
  type ToBackendEditRoleGivenResponse,
  zToBackendEditRoleGivenResponse
} from '#common/types/backend/routes/roles/edit-role-given/edit-role-given-response';
import {
  type ToBackendGetRolesRequest,
  zToBackendGetRolesRequest
} from '#common/types/backend/routes/roles/get-roles/get-roles-request';
import {
  type ToBackendGetRolesResponse,
  zToBackendGetRolesResponse
} from '#common/types/backend/routes/roles/get-roles/get-roles-response';
import {
  type ToBackendRunRequest,
  zToBackendRunRequest
} from '#common/types/backend/routes/run/run/run-request';
import {
  type ToBackendRunResponse,
  zToBackendRunResponse
} from '#common/types/backend/routes/run/run/run-response';
import {
  type ToBackendArchiveSessionRequest,
  zToBackendArchiveSessionRequest
} from '#common/types/backend/routes/sessions/archive-session/archive-session-request';
import {
  type ToBackendArchiveSessionResponse,
  zToBackendArchiveSessionResponse
} from '#common/types/backend/routes/sessions/archive-session/archive-session-response';
import {
  type ToBackendCloseExplorerSessionTabRequest,
  zToBackendCloseExplorerSessionTabRequest
} from '#common/types/backend/routes/sessions/close-explorer-session-tab/close-explorer-session-tab-request';
import {
  type ToBackendCloseExplorerSessionTabResponse,
  zToBackendCloseExplorerSessionTabResponse
} from '#common/types/backend/routes/sessions/close-explorer-session-tab/close-explorer-session-tab-response';
import {
  type ToBackendCreateEditorSessionRequest,
  zToBackendCreateEditorSessionRequest
} from '#common/types/backend/routes/sessions/create-editor-session/create-editor-session-request';
import {
  type ToBackendCreateEditorSessionResponse,
  zToBackendCreateEditorSessionResponse
} from '#common/types/backend/routes/sessions/create-editor-session/create-editor-session-response';
import {
  type ToBackendCreateExplorerSessionRequest,
  zToBackendCreateExplorerSessionRequest
} from '#common/types/backend/routes/sessions/create-explorer-session/create-explorer-session-request';
import {
  type ToBackendCreateExplorerSessionResponse,
  zToBackendCreateExplorerSessionResponse
} from '#common/types/backend/routes/sessions/create-explorer-session/create-explorer-session-response';
import {
  type ToBackendCreateSessionSseTicketRequest,
  zToBackendCreateSessionSseTicketRequest
} from '#common/types/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-request';
import {
  type ToBackendCreateSessionSseTicketResponse,
  zToBackendCreateSessionSseTicketResponse
} from '#common/types/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-response';
import {
  type ToBackendDeleteSessionRequest,
  zToBackendDeleteSessionRequest
} from '#common/types/backend/routes/sessions/delete-session/delete-session-request';
import {
  type ToBackendDeleteSessionResponse,
  zToBackendDeleteSessionResponse
} from '#common/types/backend/routes/sessions/delete-session/delete-session-response';
import {
  type ToBackendGetSessionRequest,
  zToBackendGetSessionRequest
} from '#common/types/backend/routes/sessions/get-session/get-session-request';
import {
  type ToBackendGetSessionResponse,
  zToBackendGetSessionResponse
} from '#common/types/backend/routes/sessions/get-session/get-session-response';
import {
  type ToBackendGetSessionsListRequest,
  zToBackendGetSessionsListRequest
} from '#common/types/backend/routes/sessions/get-sessions-list/get-sessions-list-request';
import {
  type ToBackendGetSessionsListResponse,
  zToBackendGetSessionsListResponse
} from '#common/types/backend/routes/sessions/get-sessions-list/get-sessions-list-response';
import {
  type ToBackendPauseEditorSessionRequest,
  zToBackendPauseEditorSessionRequest
} from '#common/types/backend/routes/sessions/pause-editor-session/pause-editor-session-request';
import {
  type ToBackendPauseEditorSessionResponse,
  zToBackendPauseEditorSessionResponse
} from '#common/types/backend/routes/sessions/pause-editor-session/pause-editor-session-response';
import {
  type ToBackendSendMessageToEditorSessionRequest,
  zToBackendSendMessageToEditorSessionRequest
} from '#common/types/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-request';
import {
  type ToBackendSendMessageToEditorSessionResponse,
  zToBackendSendMessageToEditorSessionResponse
} from '#common/types/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-response';
import {
  type ToBackendSendMessageToExplorerSessionRequest,
  zToBackendSendMessageToExplorerSessionRequest
} from '#common/types/backend/routes/sessions/send-message-to-explorer-session/send-message-to-explorer-session-request';
import {
  type ToBackendSendMessageToExplorerSessionResponse,
  zToBackendSendMessageToExplorerSessionResponse
} from '#common/types/backend/routes/sessions/send-message-to-explorer-session/send-message-to-explorer-session-response';
import {
  type ToBackendSetSessionTitleRequest,
  zToBackendSetSessionTitleRequest
} from '#common/types/backend/routes/sessions/set-session-title/set-session-title-request';
import {
  type ToBackendSetSessionTitleResponse,
  zToBackendSetSessionTitleResponse
} from '#common/types/backend/routes/sessions/set-session-title/set-session-title-response';
import {
  type ToBackendGetSkillsRequest,
  zToBackendGetSkillsRequest
} from '#common/types/backend/routes/skills/get-skills/get-skills-request';
import {
  type ToBackendGetSkillsResponse,
  zToBackendGetSkillsResponse
} from '#common/types/backend/routes/skills/get-skills/get-skills-response';
import {
  type ToBackendSpecialRebuildStructsRequest,
  zToBackendSpecialRebuildStructsRequest
} from '#common/types/backend/routes/special/special-rebuild-structs/special-rebuild-structs-request';
import {
  type ToBackendSpecialRebuildStructsResponse,
  zToBackendSpecialRebuildStructsResponse
} from '#common/types/backend/routes/special/special-rebuild-structs/special-rebuild-structs-response';
import {
  type ToBackendGetStateRequest,
  zToBackendGetStateRequest
} from '#common/types/backend/routes/state/get-state/get-state-request';
import {
  type ToBackendGetStateResponse,
  zToBackendGetStateResponse
} from '#common/types/backend/routes/state/get-state/get-state-response';
import {
  type ToBackendGetStructRequest,
  zToBackendGetStructRequest
} from '#common/types/backend/routes/structs/get-struct/get-struct-request';
import {
  type ToBackendGetStructResponse,
  zToBackendGetStructResponse
} from '#common/types/backend/routes/structs/get-struct/get-struct-response';
import {
  type ToBackendGetSuggestFieldsRequest,
  zToBackendGetSuggestFieldsRequest
} from '#common/types/backend/routes/suggest-fields/get-suggest-fields/get-suggest-fields-request';
import {
  type ToBackendGetSuggestFieldsResponse,
  zToBackendGetSuggestFieldsResponse
} from '#common/types/backend/routes/suggest-fields/get-suggest-fields/get-suggest-fields-response';
import {
  type ToBackendCloneTestRepoRequest,
  zToBackendCloneTestRepoRequest
} from '#common/types/backend/routes/test-routes/clone-test-repo/clone-test-repo-request';
import {
  type ToBackendCloneTestRepoResponse,
  zToBackendCloneTestRepoResponse
} from '#common/types/backend/routes/test-routes/clone-test-repo/clone-test-repo-response';
import {
  type ToBackendDeleteRecordsRequest,
  zToBackendDeleteRecordsRequest
} from '#common/types/backend/routes/test-routes/delete-records/delete-records-request';
import {
  type ToBackendDeleteRecordsResponse,
  zToBackendDeleteRecordsResponse
} from '#common/types/backend/routes/test-routes/delete-records/delete-records-response';
import {
  type ToBackendGetRebuildStructRequest,
  zToBackendGetRebuildStructRequest
} from '#common/types/backend/routes/test-routes/get-rebuild-struct/get-rebuild-struct-request';
import {
  type ToBackendGetRebuildStructResponse,
  zToBackendGetRebuildStructResponse
} from '#common/types/backend/routes/test-routes/get-rebuild-struct/get-rebuild-struct-response';
import {
  type ToBackendSeedRecordsRequest,
  zToBackendSeedRecordsRequest
} from '#common/types/backend/routes/test-routes/seed-records/seed-records-request';
import {
  type ToBackendSeedRecordsResponse,
  zToBackendSeedRecordsResponse
} from '#common/types/backend/routes/test-routes/seed-records/seed-records-response';
import {
  type ToBackendCompleteUserRegistrationRequest,
  zToBackendCompleteUserRegistrationRequest
} from '#common/types/backend/routes/users/complete-user-registration/complete-user-registration-request';
import {
  type ToBackendCompleteUserRegistrationResponse,
  zToBackendCompleteUserRegistrationResponse
} from '#common/types/backend/routes/users/complete-user-registration/complete-user-registration-response';
import {
  type ToBackendConfirmUserEmailRequest,
  zToBackendConfirmUserEmailRequest
} from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-request';
import {
  type ToBackendConfirmUserEmailResponse,
  zToBackendConfirmUserEmailResponse
} from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-response';
import {
  type ToBackendDeleteUserRequest,
  zToBackendDeleteUserRequest
} from '#common/types/backend/routes/users/delete-user/delete-user-request';
import {
  type ToBackendDeleteUserResponse,
  zToBackendDeleteUserResponse
} from '#common/types/backend/routes/users/delete-user/delete-user-response';
import {
  type ToBackendDeleteUserApiKeyRequest,
  zToBackendDeleteUserApiKeyRequest
} from '#common/types/backend/routes/users/delete-user-api-key/delete-user-api-key-request';
import {
  type ToBackendDeleteUserApiKeyResponse,
  zToBackendDeleteUserApiKeyResponse
} from '#common/types/backend/routes/users/delete-user-api-key/delete-user-api-key-response';
import {
  type ToBackendDeleteUserCodexAuthRequest,
  zToBackendDeleteUserCodexAuthRequest
} from '#common/types/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-request';
import {
  type ToBackendDeleteUserCodexAuthResponse,
  zToBackendDeleteUserCodexAuthResponse
} from '#common/types/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-response';
import {
  type ToBackendGenerateUserApiKeyRequest,
  zToBackendGenerateUserApiKeyRequest
} from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-request';
import {
  type ToBackendGenerateUserApiKeyResponse,
  zToBackendGenerateUserApiKeyResponse
} from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-response';
import {
  type ToBackendGetServerUsersRequest,
  zToBackendGetServerUsersRequest
} from '#common/types/backend/routes/users/get-server-users/get-server-users-request';
import {
  type ToBackendGetServerUsersResponse,
  zToBackendGetServerUsersResponse
} from '#common/types/backend/routes/users/get-server-users/get-server-users-response';
import {
  type ToBackendGetUserGivensRequest,
  zToBackendGetUserGivensRequest
} from '#common/types/backend/routes/users/get-user-givens/get-user-givens-request';
import {
  type ToBackendGetUserGivensResponse,
  zToBackendGetUserGivensResponse
} from '#common/types/backend/routes/users/get-user-givens/get-user-givens-response';
import {
  type ToBackendGetUserProfileRequest,
  zToBackendGetUserProfileRequest
} from '#common/types/backend/routes/users/get-user-profile/get-user-profile-request';
import {
  type ToBackendGetUserProfileResponse,
  zToBackendGetUserProfileResponse
} from '#common/types/backend/routes/users/get-user-profile/get-user-profile-response';
import {
  type ToBackendLoginUserRequest,
  zToBackendLoginUserRequest
} from '#common/types/backend/routes/users/login-user/login-user-request';
import {
  type ToBackendLoginUserResponse,
  zToBackendLoginUserResponse
} from '#common/types/backend/routes/users/login-user/login-user-response';
import {
  type ToBackendLogoutUserRequest,
  zToBackendLogoutUserRequest
} from '#common/types/backend/routes/users/logout-user/logout-user-request';
import {
  type ToBackendLogoutUserResponse,
  zToBackendLogoutUserResponse
} from '#common/types/backend/routes/users/logout-user/logout-user-response';
import {
  type ToBackendPollUserCodexAuthRequest,
  zToBackendPollUserCodexAuthRequest
} from '#common/types/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-request';
import {
  type ToBackendPollUserCodexAuthResponse,
  zToBackendPollUserCodexAuthResponse
} from '#common/types/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-response';
import {
  type ToBackendRegisterUserRequest,
  zToBackendRegisterUserRequest
} from '#common/types/backend/routes/users/register-user/register-user-request';
import {
  type ToBackendRegisterUserResponse,
  zToBackendRegisterUserResponse
} from '#common/types/backend/routes/users/register-user/register-user-response';
import {
  type ToBackendResendUserEmailRequest,
  zToBackendResendUserEmailRequest
} from '#common/types/backend/routes/users/resend-user-email/resend-user-email-request';
import {
  type ToBackendResendUserEmailResponse,
  zToBackendResendUserEmailResponse
} from '#common/types/backend/routes/users/resend-user-email/resend-user-email-response';
import {
  type ToBackendResetUserPasswordRequest,
  zToBackendResetUserPasswordRequest
} from '#common/types/backend/routes/users/reset-user-password/reset-user-password-request';
import {
  type ToBackendResetUserPasswordResponse,
  zToBackendResetUserPasswordResponse
} from '#common/types/backend/routes/users/reset-user-password/reset-user-password-response';
import {
  type ToBackendSetUserNameRequest,
  zToBackendSetUserNameRequest
} from '#common/types/backend/routes/users/set-user-name/set-user-name-request';
import {
  type ToBackendSetUserNameResponse,
  zToBackendSetUserNameResponse
} from '#common/types/backend/routes/users/set-user-name/set-user-name-response';
import {
  type ToBackendSetUserUiRequest,
  zToBackendSetUserUiRequest
} from '#common/types/backend/routes/users/set-user-ui/set-user-ui-request';
import {
  type ToBackendSetUserUiResponse,
  zToBackendSetUserUiResponse
} from '#common/types/backend/routes/users/set-user-ui/set-user-ui-response';
import {
  type ToBackendStartUserCodexAuthRequest,
  zToBackendStartUserCodexAuthRequest
} from '#common/types/backend/routes/users/start-user-codex-auth/start-user-codex-auth-request';
import {
  type ToBackendStartUserCodexAuthResponse,
  zToBackendStartUserCodexAuthResponse
} from '#common/types/backend/routes/users/start-user-codex-auth/start-user-codex-auth-response';
import {
  type ToBackendUpdateUserPasswordRequest,
  zToBackendUpdateUserPasswordRequest
} from '#common/types/backend/routes/users/update-user-password/update-user-password-request';
import {
  type ToBackendUpdateUserPasswordResponse,
  zToBackendUpdateUserPasswordResponse
} from '#common/types/backend/routes/users/update-user-password/update-user-password-response';
import type { ToBackendResponseBase } from '../response/to-backend-response-base';
import type { ToBackendOperation } from './to-backend-operation';

type ValidateOperationRegistry<
  TRegistry extends {
    [TOperation in ToBackendOperation]: {
      request: {
        operation: TOperation;
        traceId: string;
        idempotencyKey: string;
        input: unknown;
      };
      response: ToBackendResponseBase<TOperation, unknown, unknown>;
    };
  }
> = TRegistry;

export type ToBackendOperationRegistry = ValidateOperationRegistry<{
  getAvatarBig: {
    request: ToBackendGetAvatarBigRequest;
    response: ToBackendGetAvatarBigResponse;
  };
  setAvatar: {
    request: ToBackendSetAvatarRequest;
    response: ToBackendSetAvatarResponse;
  };
  createBranch: {
    request: ToBackendCreateBranchRequest;
    response: ToBackendCreateBranchResponse;
  };
  deleteBranch: {
    request: ToBackendDeleteBranchRequest;
    response: ToBackendDeleteBranchResponse;
  };
  getBranchesList: {
    request: ToBackendGetBranchesListRequest;
    response: ToBackendGetBranchesListResponse;
  };
  isBranchExist: {
    request: ToBackendIsBranchExistRequest;
    response: ToBackendIsBranchExistResponse;
  };
  moveCatalogNode: {
    request: ToBackendMoveCatalogNodeRequest;
    response: ToBackendMoveCatalogNodeResponse;
  };
  renameCatalogNode: {
    request: ToBackendRenameCatalogNodeRequest;
    response: ToBackendRenameCatalogNodeResponse;
  };
  createDraftChart: {
    request: ToBackendCreateDraftChartRequest;
    response: ToBackendCreateDraftChartResponse;
  };
  deleteChart: {
    request: ToBackendDeleteChartRequest;
    response: ToBackendDeleteChartResponse;
  };
  deleteDraftCharts: {
    request: ToBackendDeleteDraftChartsRequest;
    response: ToBackendDeleteDraftChartsResponse;
  };
  editDraftChart: {
    request: ToBackendEditDraftChartRequest;
    response: ToBackendEditDraftChartResponse;
  };
  getChart: {
    request: ToBackendGetChartRequest;
    response: ToBackendGetChartResponse;
  };
  getCharts: {
    request: ToBackendGetChartsRequest;
    response: ToBackendGetChartsResponse;
  };
  getExplorerChartTab: {
    request: ToBackendGetExplorerChartTabRequest;
    response: ToBackendGetExplorerChartTabResponse;
  };
  produceExplorerChart: {
    request: ToBackendProduceExplorerChartRequest;
    response: ToBackendProduceExplorerChartResponse;
  };
  saveCreateChart: {
    request: ToBackendSaveCreateChartRequest;
    response: ToBackendSaveCreateChartResponse;
  };
  saveModifyChart: {
    request: ToBackendSaveModifyChartRequest;
    response: ToBackendSaveModifyChartResponse;
  };
  checkSignUp: {
    request: ToBackendCheckSignUpRequest;
    response: ToBackendCheckSignUpResponse;
  };
  clearCachedColumn: {
    request: ToBackendClearCachedColumnRequest;
    response: ToBackendClearCachedColumnResponse;
  };
  createConnection: {
    request: ToBackendCreateConnectionRequest;
    response: ToBackendCreateConnectionResponse;
  };
  deleteConnection: {
    request: ToBackendDeleteConnectionRequest;
    response: ToBackendDeleteConnectionResponse;
  };
  editConnection: {
    request: ToBackendEditConnectionRequest;
    response: ToBackendEditConnectionResponse;
  };
  getCachedColumns: {
    request: ToBackendGetCachedColumnsRequest;
    response: ToBackendGetCachedColumnsResponse;
  };
  getConnectionSample: {
    request: ToBackendGetConnectionSampleRequest;
    response: ToBackendGetConnectionSampleResponse;
  };
  getConnectionSchemas: {
    request: ToBackendGetConnectionSchemasRequest;
    response: ToBackendGetConnectionSchemasResponse;
  };
  getConnections: {
    request: ToBackendGetConnectionsRequest;
    response: ToBackendGetConnectionsResponse;
  };
  getConnectionsList: {
    request: ToBackendGetConnectionsListRequest;
    response: ToBackendGetConnectionsListResponse;
  };
  refreshCachedColumn: {
    request: ToBackendRefreshCachedColumnRequest;
    response: ToBackendRefreshCachedColumnResponse;
  };
  testConnection: {
    request: ToBackendTestConnectionRequest;
    response: ToBackendTestConnectionResponse;
  };
  viewCachedColumn: {
    request: ToBackendViewCachedColumnRequest;
    response: ToBackendViewCachedColumnResponse;
  };
  createDraftDashboard: {
    request: ToBackendCreateDraftDashboardRequest;
    response: ToBackendCreateDraftDashboardResponse;
  };
  deleteDashboard: {
    request: ToBackendDeleteDashboardRequest;
    response: ToBackendDeleteDashboardResponse;
  };
  deleteDraftDashboards: {
    request: ToBackendDeleteDraftDashboardsRequest;
    response: ToBackendDeleteDraftDashboardsResponse;
  };
  editDraftDashboard: {
    request: ToBackendEditDraftDashboardRequest;
    response: ToBackendEditDraftDashboardResponse;
  };
  getDashboard: {
    request: ToBackendGetDashboardRequest;
    response: ToBackendGetDashboardResponse;
  };
  getDashboards: {
    request: ToBackendGetDashboardsRequest;
    response: ToBackendGetDashboardsResponse;
  };
  saveCreateDashboard: {
    request: ToBackendSaveCreateDashboardRequest;
    response: ToBackendSaveCreateDashboardResponse;
  };
  saveModifyDashboard: {
    request: ToBackendSaveModifyDashboardRequest;
    response: ToBackendSaveModifyDashboardResponse;
  };
  createEnv: {
    request: ToBackendCreateEnvRequest;
    response: ToBackendCreateEnvResponse;
  };
  createEnvUser: {
    request: ToBackendCreateEnvUserRequest;
    response: ToBackendCreateEnvUserResponse;
  };
  createEnvVar: {
    request: ToBackendCreateEnvVarRequest;
    response: ToBackendCreateEnvVarResponse;
  };
  deleteEnv: {
    request: ToBackendDeleteEnvRequest;
    response: ToBackendDeleteEnvResponse;
  };
  deleteEnvUser: {
    request: ToBackendDeleteEnvUserRequest;
    response: ToBackendDeleteEnvUserResponse;
  };
  deleteEnvVar: {
    request: ToBackendDeleteEnvVarRequest;
    response: ToBackendDeleteEnvVarResponse;
  };
  editEnvFallbacks: {
    request: ToBackendEditEnvFallbacksRequest;
    response: ToBackendEditEnvFallbacksResponse;
  };
  editEnvVar: {
    request: ToBackendEditEnvVarRequest;
    response: ToBackendEditEnvVarResponse;
  };
  getEnvs: {
    request: ToBackendGetEnvsRequest;
    response: ToBackendGetEnvsResponse;
  };
  getEnvsList: {
    request: ToBackendGetEnvsListRequest;
    response: ToBackendGetEnvsListResponse;
  };
  setFavorite: {
    request: ToBackendSetFavoriteRequest;
    response: ToBackendSetFavoriteResponse;
  };
  createFile: {
    request: ToBackendCreateFileRequest;
    response: ToBackendCreateFileResponse;
  };
  deleteFile: {
    request: ToBackendDeleteFileRequest;
    response: ToBackendDeleteFileResponse;
  };
  getFile: {
    request: ToBackendGetFileRequest;
    response: ToBackendGetFileResponse;
  };
  saveFile: {
    request: ToBackendSaveFileRequest;
    response: ToBackendSaveFileResponse;
  };
  validateFiles: {
    request: ToBackendValidateFilesRequest;
    response: ToBackendValidateFilesResponse;
  };
  createFolder: {
    request: ToBackendCreateFolderRequest;
    response: ToBackendCreateFolderResponse;
  };
  deleteFolder: {
    request: ToBackendDeleteFolderRequest;
    response: ToBackendDeleteFolderResponse;
  };
  createGiven: {
    request: ToBackendCreateGivenRequest;
    response: ToBackendCreateGivenResponse;
  };
  deleteGiven: {
    request: ToBackendDeleteGivenRequest;
    response: ToBackendDeleteGivenResponse;
  };
  editGiven: {
    request: ToBackendEditGivenRequest;
    response: ToBackendEditGivenResponse;
  };
  getGivens: {
    request: ToBackendGetGivensRequest;
    response: ToBackendGetGivensResponse;
  };
  createLlmModel: {
    request: ToBackendCreateLlmModelRequest;
    response: ToBackendCreateLlmModelResponse;
  };
  deleteLlmModel: {
    request: ToBackendDeleteLlmModelRequest;
    response: ToBackendDeleteLlmModelResponse;
  };
  editLlmModel: {
    request: ToBackendEditLlmModelRequest;
    response: ToBackendEditLlmModelResponse;
  };
  getLlmModelParts: {
    request: ToBackendGetLlmModelPartsRequest;
    response: ToBackendGetLlmModelPartsResponse;
  };
  getLlmModelsWithProvider: {
    request: ToBackendGetLlmModelsWithProviderRequest;
    response: ToBackendGetLlmModelsWithProviderResponse;
  };
  duplicateMconfigAndQuery: {
    request: ToBackendDuplicateMconfigAndQueryRequest;
    response: ToBackendDuplicateMconfigAndQueryResponse;
  };
  groupMetricByDimension: {
    request: ToBackendGroupMetricByDimensionRequest;
    response: ToBackendGroupMetricByDimensionResponse;
  };
  suggestDimensionValues: {
    request: ToBackendSuggestDimensionValuesRequest;
    response: ToBackendSuggestDimensionValuesResponse;
  };
  createMember: {
    request: ToBackendCreateMemberRequest;
    response: ToBackendCreateMemberResponse;
  };
  deleteMember: {
    request: ToBackendDeleteMemberRequest;
    response: ToBackendDeleteMemberResponse;
  };
  editMember: {
    request: ToBackendEditMemberRequest;
    response: ToBackendEditMemberResponse;
  };
  getMemberGivens: {
    request: ToBackendGetMemberGivensRequest;
    response: ToBackendGetMemberGivensResponse;
  };
  getMembers: {
    request: ToBackendGetMembersRequest;
    response: ToBackendGetMembersResponse;
  };
  getMembersList: {
    request: ToBackendGetMembersListRequest;
    response: ToBackendGetMembersListResponse;
  };
  getModel: {
    request: ToBackendGetModelRequest;
    response: ToBackendGetModelResponse;
  };
  getModels: {
    request: ToBackendGetModelsRequest;
    response: ToBackendGetModelsResponse;
  };
  checkLastNav: {
    request: ToBackendCheckLastNavRequest;
    response: ToBackendCheckLastNavResponse;
  };
  getNav: {
    request: ToBackendGetNavRequest;
    response: ToBackendGetNavResponse;
  };
  getOrgUsers: {
    request: ToBackendGetOrgUsersRequest;
    response: ToBackendGetOrgUsersResponse;
  };
  createOrg: {
    request: ToBackendCreateOrgRequest;
    response: ToBackendCreateOrgResponse;
  };
  deleteOrg: {
    request: ToBackendDeleteOrgRequest;
    response: ToBackendDeleteOrgResponse;
  };
  getOrg: {
    request: ToBackendGetOrgRequest;
    response: ToBackendGetOrgResponse;
  };
  getOrgsList: {
    request: ToBackendGetOrgsListRequest;
    response: ToBackendGetOrgsListResponse;
  };
  isOrgExist: {
    request: ToBackendIsOrgExistRequest;
    response: ToBackendIsOrgExistResponse;
  };
  setOrgInfo: {
    request: ToBackendSetOrgInfoRequest;
    response: ToBackendSetOrgInfoResponse;
  };
  setOrgOwner: {
    request: ToBackendSetOrgOwnerRequest;
    response: ToBackendSetOrgOwnerResponse;
  };
  createProject: {
    request: ToBackendCreateProjectRequest;
    response: ToBackendCreateProjectResponse;
  };
  deleteProject: {
    request: ToBackendDeleteProjectRequest;
    response: ToBackendDeleteProjectResponse;
  };
  generateProjectRemoteKey: {
    request: ToBackendGenerateProjectRemoteKeyRequest;
    response: ToBackendGenerateProjectRemoteKeyResponse;
  };
  getProject: {
    request: ToBackendGetProjectRequest;
    response: ToBackendGetProjectResponse;
  };
  getProjectsList: {
    request: ToBackendGetProjectsListRequest;
    response: ToBackendGetProjectsListResponse;
  };
  isProjectExist: {
    request: ToBackendIsProjectExistRequest;
    response: ToBackendIsProjectExistResponse;
  };
  setProjectAllowTimezones: {
    request: ToBackendSetProjectAllowTimezonesRequest;
    response: ToBackendSetProjectAllowTimezonesResponse;
  };
  setProjectInfo: {
    request: ToBackendSetProjectInfoRequest;
    response: ToBackendSetProjectInfoResponse;
  };
  setProjectSandboxProvider: {
    request: ToBackendSetProjectSandboxProviderRequest;
    response: ToBackendSetProjectSandboxProviderResponse;
  };
  setProjectTimezone: {
    request: ToBackendSetProjectTimezoneRequest;
    response: ToBackendSetProjectTimezoneResponse;
  };
  setProjectWeekStart: {
    request: ToBackendSetProjectWeekStartRequest;
    response: ToBackendSetProjectWeekStartResponse;
  };
  createProvider: {
    request: ToBackendCreateProviderRequest;
    response: ToBackendCreateProviderResponse;
  };
  deleteProvider: {
    request: ToBackendDeleteProviderRequest;
    response: ToBackendDeleteProviderResponse;
  };
  editProvider: {
    request: ToBackendEditProviderRequest;
    response: ToBackendEditProviderResponse;
  };
  getProviders: {
    request: ToBackendGetProvidersRequest;
    response: ToBackendGetProvidersResponse;
  };
  toggleProvider: {
    request: ToBackendToggleProviderRequest;
    response: ToBackendToggleProviderResponse;
  };
  cancelQueries: {
    request: ToBackendCancelQueriesRequest;
    response: ToBackendCancelQueriesResponse;
  };
  getQueries: {
    request: ToBackendGetQueriesRequest;
    response: ToBackendGetQueriesResponse;
  };
  getQuery: {
    request: ToBackendGetQueryRequest;
    response: ToBackendGetQueryResponse;
  };
  runQueries: {
    request: ToBackendRunQueriesRequest;
    response: ToBackendRunQueriesResponse;
  };
  runQueriesDry: {
    request: ToBackendRunQueriesDryRequest;
    response: ToBackendRunQueriesDryResponse;
  };
  getQueryInfo: {
    request: ToBackendGetQueryInfoRequest;
    response: ToBackendGetQueryInfoResponse;
  };
  createDraftReport: {
    request: ToBackendCreateDraftReportRequest;
    response: ToBackendCreateDraftReportResponse;
  };
  deleteDraftReports: {
    request: ToBackendDeleteDraftReportsRequest;
    response: ToBackendDeleteDraftReportsResponse;
  };
  deleteReport: {
    request: ToBackendDeleteReportRequest;
    response: ToBackendDeleteReportResponse;
  };
  editDraftReport: {
    request: ToBackendEditDraftReportRequest;
    response: ToBackendEditDraftReportResponse;
  };
  getReport: {
    request: ToBackendGetReportRequest;
    response: ToBackendGetReportResponse;
  };
  getReports: {
    request: ToBackendGetReportsRequest;
    response: ToBackendGetReportsResponse;
  };
  saveCreateReport: {
    request: ToBackendSaveCreateReportRequest;
    response: ToBackendSaveCreateReportResponse;
  };
  saveModifyReport: {
    request: ToBackendSaveModifyReportRequest;
    response: ToBackendSaveModifyReportResponse;
  };
  commitRepo: {
    request: ToBackendCommitRepoRequest;
    response: ToBackendCommitRepoResponse;
  };
  getRepo: {
    request: ToBackendGetRepoRequest;
    response: ToBackendGetRepoResponse;
  };
  mergeRepo: {
    request: ToBackendMergeRepoRequest;
    response: ToBackendMergeRepoResponse;
  };
  pullRepo: {
    request: ToBackendPullRepoRequest;
    response: ToBackendPullRepoResponse;
  };
  pushRepo: {
    request: ToBackendPushRepoRequest;
    response: ToBackendPushRepoResponse;
  };
  revertRepoToLastCommit: {
    request: ToBackendRevertRepoToLastCommitRequest;
    response: ToBackendRevertRepoToLastCommitResponse;
  };
  revertRepoToRemote: {
    request: ToBackendRevertRepoToRemoteRequest;
    response: ToBackendRevertRepoToRemoteResponse;
  };
  syncRepo: {
    request: ToBackendSyncRepoRequest;
    response: ToBackendSyncRepoResponse;
  };
  createRole: {
    request: ToBackendCreateRoleRequest;
    response: ToBackendCreateRoleResponse;
  };
  createRoleGiven: {
    request: ToBackendCreateRoleGivenRequest;
    response: ToBackendCreateRoleGivenResponse;
  };
  deleteRole: {
    request: ToBackendDeleteRoleRequest;
    response: ToBackendDeleteRoleResponse;
  };
  deleteRoleGiven: {
    request: ToBackendDeleteRoleGivenRequest;
    response: ToBackendDeleteRoleGivenResponse;
  };
  editRoleGiven: {
    request: ToBackendEditRoleGivenRequest;
    response: ToBackendEditRoleGivenResponse;
  };
  getRoles: {
    request: ToBackendGetRolesRequest;
    response: ToBackendGetRolesResponse;
  };
  run: { request: ToBackendRunRequest; response: ToBackendRunResponse };
  archiveSession: {
    request: ToBackendArchiveSessionRequest;
    response: ToBackendArchiveSessionResponse;
  };
  closeExplorerSessionTab: {
    request: ToBackendCloseExplorerSessionTabRequest;
    response: ToBackendCloseExplorerSessionTabResponse;
  };
  createEditorSession: {
    request: ToBackendCreateEditorSessionRequest;
    response: ToBackendCreateEditorSessionResponse;
  };
  createExplorerSession: {
    request: ToBackendCreateExplorerSessionRequest;
    response: ToBackendCreateExplorerSessionResponse;
  };
  createSessionSseTicket: {
    request: ToBackendCreateSessionSseTicketRequest;
    response: ToBackendCreateSessionSseTicketResponse;
  };
  deleteSession: {
    request: ToBackendDeleteSessionRequest;
    response: ToBackendDeleteSessionResponse;
  };
  getSession: {
    request: ToBackendGetSessionRequest;
    response: ToBackendGetSessionResponse;
  };
  getSessionsList: {
    request: ToBackendGetSessionsListRequest;
    response: ToBackendGetSessionsListResponse;
  };
  pauseEditorSession: {
    request: ToBackendPauseEditorSessionRequest;
    response: ToBackendPauseEditorSessionResponse;
  };
  sendMessageToEditorSession: {
    request: ToBackendSendMessageToEditorSessionRequest;
    response: ToBackendSendMessageToEditorSessionResponse;
  };
  sendMessageToExplorerSession: {
    request: ToBackendSendMessageToExplorerSessionRequest;
    response: ToBackendSendMessageToExplorerSessionResponse;
  };
  setSessionTitle: {
    request: ToBackendSetSessionTitleRequest;
    response: ToBackendSetSessionTitleResponse;
  };
  getSkills: {
    request: ToBackendGetSkillsRequest;
    response: ToBackendGetSkillsResponse;
  };
  specialRebuildStructs: {
    request: ToBackendSpecialRebuildStructsRequest;
    response: ToBackendSpecialRebuildStructsResponse;
  };
  getState: {
    request: ToBackendGetStateRequest;
    response: ToBackendGetStateResponse;
  };
  getStruct: {
    request: ToBackendGetStructRequest;
    response: ToBackendGetStructResponse;
  };
  getSuggestFields: {
    request: ToBackendGetSuggestFieldsRequest;
    response: ToBackendGetSuggestFieldsResponse;
  };
  cloneTestRepo: {
    request: ToBackendCloneTestRepoRequest;
    response: ToBackendCloneTestRepoResponse;
  };
  deleteRecords: {
    request: ToBackendDeleteRecordsRequest;
    response: ToBackendDeleteRecordsResponse;
  };
  getRebuildStruct: {
    request: ToBackendGetRebuildStructRequest;
    response: ToBackendGetRebuildStructResponse;
  };
  seedRecords: {
    request: ToBackendSeedRecordsRequest;
    response: ToBackendSeedRecordsResponse;
  };
  completeUserRegistration: {
    request: ToBackendCompleteUserRegistrationRequest;
    response: ToBackendCompleteUserRegistrationResponse;
  };
  confirmUserEmail: {
    request: ToBackendConfirmUserEmailRequest;
    response: ToBackendConfirmUserEmailResponse;
  };
  deleteUser: {
    request: ToBackendDeleteUserRequest;
    response: ToBackendDeleteUserResponse;
  };
  deleteUserApiKey: {
    request: ToBackendDeleteUserApiKeyRequest;
    response: ToBackendDeleteUserApiKeyResponse;
  };
  deleteUserCodexAuth: {
    request: ToBackendDeleteUserCodexAuthRequest;
    response: ToBackendDeleteUserCodexAuthResponse;
  };
  generateUserApiKey: {
    request: ToBackendGenerateUserApiKeyRequest;
    response: ToBackendGenerateUserApiKeyResponse;
  };
  getServerUsers: {
    request: ToBackendGetServerUsersRequest;
    response: ToBackendGetServerUsersResponse;
  };
  getUserGivens: {
    request: ToBackendGetUserGivensRequest;
    response: ToBackendGetUserGivensResponse;
  };
  getUserProfile: {
    request: ToBackendGetUserProfileRequest;
    response: ToBackendGetUserProfileResponse;
  };
  loginUser: {
    request: ToBackendLoginUserRequest;
    response: ToBackendLoginUserResponse;
  };
  logoutUser: {
    request: ToBackendLogoutUserRequest;
    response: ToBackendLogoutUserResponse;
  };
  pollUserCodexAuth: {
    request: ToBackendPollUserCodexAuthRequest;
    response: ToBackendPollUserCodexAuthResponse;
  };
  registerUser: {
    request: ToBackendRegisterUserRequest;
    response: ToBackendRegisterUserResponse;
  };
  resendUserEmail: {
    request: ToBackendResendUserEmailRequest;
    response: ToBackendResendUserEmailResponse;
  };
  resetUserPassword: {
    request: ToBackendResetUserPasswordRequest;
    response: ToBackendResetUserPasswordResponse;
  };
  setUserName: {
    request: ToBackendSetUserNameRequest;
    response: ToBackendSetUserNameResponse;
  };
  setUserUi: {
    request: ToBackendSetUserUiRequest;
    response: ToBackendSetUserUiResponse;
  };
  startUserCodexAuth: {
    request: ToBackendStartUserCodexAuthRequest;
    response: ToBackendStartUserCodexAuthResponse;
  };
  updateUserPassword: {
    request: ToBackendUpdateUserPasswordRequest;
    response: ToBackendUpdateUserPasswordResponse;
  };
}>;

export const zToBackendOperationRegistry = {
  getAvatarBig: {
    request: zToBackendGetAvatarBigRequest,
    response: zToBackendGetAvatarBigResponse
  },
  setAvatar: {
    request: zToBackendSetAvatarRequest,
    response: zToBackendSetAvatarResponse
  },
  createBranch: {
    request: zToBackendCreateBranchRequest,
    response: zToBackendCreateBranchResponse
  },
  deleteBranch: {
    request: zToBackendDeleteBranchRequest,
    response: zToBackendDeleteBranchResponse
  },
  getBranchesList: {
    request: zToBackendGetBranchesListRequest,
    response: zToBackendGetBranchesListResponse
  },
  isBranchExist: {
    request: zToBackendIsBranchExistRequest,
    response: zToBackendIsBranchExistResponse
  },
  moveCatalogNode: {
    request: zToBackendMoveCatalogNodeRequest,
    response: zToBackendMoveCatalogNodeResponse
  },
  renameCatalogNode: {
    request: zToBackendRenameCatalogNodeRequest,
    response: zToBackendRenameCatalogNodeResponse
  },
  createDraftChart: {
    request: zToBackendCreateDraftChartRequest,
    response: zToBackendCreateDraftChartResponse
  },
  deleteChart: {
    request: zToBackendDeleteChartRequest,
    response: zToBackendDeleteChartResponse
  },
  deleteDraftCharts: {
    request: zToBackendDeleteDraftChartsRequest,
    response: zToBackendDeleteDraftChartsResponse
  },
  editDraftChart: {
    request: zToBackendEditDraftChartRequest,
    response: zToBackendEditDraftChartResponse
  },
  getChart: {
    request: zToBackendGetChartRequest,
    response: zToBackendGetChartResponse
  },
  getCharts: {
    request: zToBackendGetChartsRequest,
    response: zToBackendGetChartsResponse
  },
  getExplorerChartTab: {
    request: zToBackendGetExplorerChartTabRequest,
    response: zToBackendGetExplorerChartTabResponse
  },
  produceExplorerChart: {
    request: zToBackendProduceExplorerChartRequest,
    response: zToBackendProduceExplorerChartResponse
  },
  saveCreateChart: {
    request: zToBackendSaveCreateChartRequest,
    response: zToBackendSaveCreateChartResponse
  },
  saveModifyChart: {
    request: zToBackendSaveModifyChartRequest,
    response: zToBackendSaveModifyChartResponse
  },
  checkSignUp: {
    request: zToBackendCheckSignUpRequest,
    response: zToBackendCheckSignUpResponse
  },
  clearCachedColumn: {
    request: zToBackendClearCachedColumnRequest,
    response: zToBackendClearCachedColumnResponse
  },
  createConnection: {
    request: zToBackendCreateConnectionRequest,
    response: zToBackendCreateConnectionResponse
  },
  deleteConnection: {
    request: zToBackendDeleteConnectionRequest,
    response: zToBackendDeleteConnectionResponse
  },
  editConnection: {
    request: zToBackendEditConnectionRequest,
    response: zToBackendEditConnectionResponse
  },
  getCachedColumns: {
    request: zToBackendGetCachedColumnsRequest,
    response: zToBackendGetCachedColumnsResponse
  },
  getConnectionSample: {
    request: zToBackendGetConnectionSampleRequest,
    response: zToBackendGetConnectionSampleResponse
  },
  getConnectionSchemas: {
    request: zToBackendGetConnectionSchemasRequest,
    response: zToBackendGetConnectionSchemasResponse
  },
  getConnections: {
    request: zToBackendGetConnectionsRequest,
    response: zToBackendGetConnectionsResponse
  },
  getConnectionsList: {
    request: zToBackendGetConnectionsListRequest,
    response: zToBackendGetConnectionsListResponse
  },
  refreshCachedColumn: {
    request: zToBackendRefreshCachedColumnRequest,
    response: zToBackendRefreshCachedColumnResponse
  },
  testConnection: {
    request: zToBackendTestConnectionRequest,
    response: zToBackendTestConnectionResponse
  },
  viewCachedColumn: {
    request: zToBackendViewCachedColumnRequest,
    response: zToBackendViewCachedColumnResponse
  },
  createDraftDashboard: {
    request: zToBackendCreateDraftDashboardRequest,
    response: zToBackendCreateDraftDashboardResponse
  },
  deleteDashboard: {
    request: zToBackendDeleteDashboardRequest,
    response: zToBackendDeleteDashboardResponse
  },
  deleteDraftDashboards: {
    request: zToBackendDeleteDraftDashboardsRequest,
    response: zToBackendDeleteDraftDashboardsResponse
  },
  editDraftDashboard: {
    request: zToBackendEditDraftDashboardRequest,
    response: zToBackendEditDraftDashboardResponse
  },
  getDashboard: {
    request: zToBackendGetDashboardRequest,
    response: zToBackendGetDashboardResponse
  },
  getDashboards: {
    request: zToBackendGetDashboardsRequest,
    response: zToBackendGetDashboardsResponse
  },
  saveCreateDashboard: {
    request: zToBackendSaveCreateDashboardRequest,
    response: zToBackendSaveCreateDashboardResponse
  },
  saveModifyDashboard: {
    request: zToBackendSaveModifyDashboardRequest,
    response: zToBackendSaveModifyDashboardResponse
  },
  createEnv: {
    request: zToBackendCreateEnvRequest,
    response: zToBackendCreateEnvResponse
  },
  createEnvUser: {
    request: zToBackendCreateEnvUserRequest,
    response: zToBackendCreateEnvUserResponse
  },
  createEnvVar: {
    request: zToBackendCreateEnvVarRequest,
    response: zToBackendCreateEnvVarResponse
  },
  deleteEnv: {
    request: zToBackendDeleteEnvRequest,
    response: zToBackendDeleteEnvResponse
  },
  deleteEnvUser: {
    request: zToBackendDeleteEnvUserRequest,
    response: zToBackendDeleteEnvUserResponse
  },
  deleteEnvVar: {
    request: zToBackendDeleteEnvVarRequest,
    response: zToBackendDeleteEnvVarResponse
  },
  editEnvFallbacks: {
    request: zToBackendEditEnvFallbacksRequest,
    response: zToBackendEditEnvFallbacksResponse
  },
  editEnvVar: {
    request: zToBackendEditEnvVarRequest,
    response: zToBackendEditEnvVarResponse
  },
  getEnvs: {
    request: zToBackendGetEnvsRequest,
    response: zToBackendGetEnvsResponse
  },
  getEnvsList: {
    request: zToBackendGetEnvsListRequest,
    response: zToBackendGetEnvsListResponse
  },
  setFavorite: {
    request: zToBackendSetFavoriteRequest,
    response: zToBackendSetFavoriteResponse
  },
  createFile: {
    request: zToBackendCreateFileRequest,
    response: zToBackendCreateFileResponse
  },
  deleteFile: {
    request: zToBackendDeleteFileRequest,
    response: zToBackendDeleteFileResponse
  },
  getFile: {
    request: zToBackendGetFileRequest,
    response: zToBackendGetFileResponse
  },
  saveFile: {
    request: zToBackendSaveFileRequest,
    response: zToBackendSaveFileResponse
  },
  validateFiles: {
    request: zToBackendValidateFilesRequest,
    response: zToBackendValidateFilesResponse
  },
  createFolder: {
    request: zToBackendCreateFolderRequest,
    response: zToBackendCreateFolderResponse
  },
  deleteFolder: {
    request: zToBackendDeleteFolderRequest,
    response: zToBackendDeleteFolderResponse
  },
  createGiven: {
    request: zToBackendCreateGivenRequest,
    response: zToBackendCreateGivenResponse
  },
  deleteGiven: {
    request: zToBackendDeleteGivenRequest,
    response: zToBackendDeleteGivenResponse
  },
  editGiven: {
    request: zToBackendEditGivenRequest,
    response: zToBackendEditGivenResponse
  },
  getGivens: {
    request: zToBackendGetGivensRequest,
    response: zToBackendGetGivensResponse
  },
  createLlmModel: {
    request: zToBackendCreateLlmModelRequest,
    response: zToBackendCreateLlmModelResponse
  },
  deleteLlmModel: {
    request: zToBackendDeleteLlmModelRequest,
    response: zToBackendDeleteLlmModelResponse
  },
  editLlmModel: {
    request: zToBackendEditLlmModelRequest,
    response: zToBackendEditLlmModelResponse
  },
  getLlmModelParts: {
    request: zToBackendGetLlmModelPartsRequest,
    response: zToBackendGetLlmModelPartsResponse
  },
  getLlmModelsWithProvider: {
    request: zToBackendGetLlmModelsWithProviderRequest,
    response: zToBackendGetLlmModelsWithProviderResponse
  },
  duplicateMconfigAndQuery: {
    request: zToBackendDuplicateMconfigAndQueryRequest,
    response: zToBackendDuplicateMconfigAndQueryResponse
  },
  groupMetricByDimension: {
    request: zToBackendGroupMetricByDimensionRequest,
    response: zToBackendGroupMetricByDimensionResponse
  },
  suggestDimensionValues: {
    request: zToBackendSuggestDimensionValuesRequest,
    response: zToBackendSuggestDimensionValuesResponse
  },
  createMember: {
    request: zToBackendCreateMemberRequest,
    response: zToBackendCreateMemberResponse
  },
  deleteMember: {
    request: zToBackendDeleteMemberRequest,
    response: zToBackendDeleteMemberResponse
  },
  editMember: {
    request: zToBackendEditMemberRequest,
    response: zToBackendEditMemberResponse
  },
  getMemberGivens: {
    request: zToBackendGetMemberGivensRequest,
    response: zToBackendGetMemberGivensResponse
  },
  getMembers: {
    request: zToBackendGetMembersRequest,
    response: zToBackendGetMembersResponse
  },
  getMembersList: {
    request: zToBackendGetMembersListRequest,
    response: zToBackendGetMembersListResponse
  },
  getModel: {
    request: zToBackendGetModelRequest,
    response: zToBackendGetModelResponse
  },
  getModels: {
    request: zToBackendGetModelsRequest,
    response: zToBackendGetModelsResponse
  },
  checkLastNav: {
    request: zToBackendCheckLastNavRequest,
    response: zToBackendCheckLastNavResponse
  },
  getNav: {
    request: zToBackendGetNavRequest,
    response: zToBackendGetNavResponse
  },
  getOrgUsers: {
    request: zToBackendGetOrgUsersRequest,
    response: zToBackendGetOrgUsersResponse
  },
  createOrg: {
    request: zToBackendCreateOrgRequest,
    response: zToBackendCreateOrgResponse
  },
  deleteOrg: {
    request: zToBackendDeleteOrgRequest,
    response: zToBackendDeleteOrgResponse
  },
  getOrg: {
    request: zToBackendGetOrgRequest,
    response: zToBackendGetOrgResponse
  },
  getOrgsList: {
    request: zToBackendGetOrgsListRequest,
    response: zToBackendGetOrgsListResponse
  },
  isOrgExist: {
    request: zToBackendIsOrgExistRequest,
    response: zToBackendIsOrgExistResponse
  },
  setOrgInfo: {
    request: zToBackendSetOrgInfoRequest,
    response: zToBackendSetOrgInfoResponse
  },
  setOrgOwner: {
    request: zToBackendSetOrgOwnerRequest,
    response: zToBackendSetOrgOwnerResponse
  },
  createProject: {
    request: zToBackendCreateProjectRequest,
    response: zToBackendCreateProjectResponse
  },
  deleteProject: {
    request: zToBackendDeleteProjectRequest,
    response: zToBackendDeleteProjectResponse
  },
  generateProjectRemoteKey: {
    request: zToBackendGenerateProjectRemoteKeyRequest,
    response: zToBackendGenerateProjectRemoteKeyResponse
  },
  getProject: {
    request: zToBackendGetProjectRequest,
    response: zToBackendGetProjectResponse
  },
  getProjectsList: {
    request: zToBackendGetProjectsListRequest,
    response: zToBackendGetProjectsListResponse
  },
  isProjectExist: {
    request: zToBackendIsProjectExistRequest,
    response: zToBackendIsProjectExistResponse
  },
  setProjectAllowTimezones: {
    request: zToBackendSetProjectAllowTimezonesRequest,
    response: zToBackendSetProjectAllowTimezonesResponse
  },
  setProjectInfo: {
    request: zToBackendSetProjectInfoRequest,
    response: zToBackendSetProjectInfoResponse
  },
  setProjectSandboxProvider: {
    request: zToBackendSetProjectSandboxProviderRequest,
    response: zToBackendSetProjectSandboxProviderResponse
  },
  setProjectTimezone: {
    request: zToBackendSetProjectTimezoneRequest,
    response: zToBackendSetProjectTimezoneResponse
  },
  setProjectWeekStart: {
    request: zToBackendSetProjectWeekStartRequest,
    response: zToBackendSetProjectWeekStartResponse
  },
  createProvider: {
    request: zToBackendCreateProviderRequest,
    response: zToBackendCreateProviderResponse
  },
  deleteProvider: {
    request: zToBackendDeleteProviderRequest,
    response: zToBackendDeleteProviderResponse
  },
  editProvider: {
    request: zToBackendEditProviderRequest,
    response: zToBackendEditProviderResponse
  },
  getProviders: {
    request: zToBackendGetProvidersRequest,
    response: zToBackendGetProvidersResponse
  },
  toggleProvider: {
    request: zToBackendToggleProviderRequest,
    response: zToBackendToggleProviderResponse
  },
  cancelQueries: {
    request: zToBackendCancelQueriesRequest,
    response: zToBackendCancelQueriesResponse
  },
  getQueries: {
    request: zToBackendGetQueriesRequest,
    response: zToBackendGetQueriesResponse
  },
  getQuery: {
    request: zToBackendGetQueryRequest,
    response: zToBackendGetQueryResponse
  },
  runQueries: {
    request: zToBackendRunQueriesRequest,
    response: zToBackendRunQueriesResponse
  },
  runQueriesDry: {
    request: zToBackendRunQueriesDryRequest,
    response: zToBackendRunQueriesDryResponse
  },
  getQueryInfo: {
    request: zToBackendGetQueryInfoRequest,
    response: zToBackendGetQueryInfoResponse
  },
  createDraftReport: {
    request: zToBackendCreateDraftReportRequest,
    response: zToBackendCreateDraftReportResponse
  },
  deleteDraftReports: {
    request: zToBackendDeleteDraftReportsRequest,
    response: zToBackendDeleteDraftReportsResponse
  },
  deleteReport: {
    request: zToBackendDeleteReportRequest,
    response: zToBackendDeleteReportResponse
  },
  editDraftReport: {
    request: zToBackendEditDraftReportRequest,
    response: zToBackendEditDraftReportResponse
  },
  getReport: {
    request: zToBackendGetReportRequest,
    response: zToBackendGetReportResponse
  },
  getReports: {
    request: zToBackendGetReportsRequest,
    response: zToBackendGetReportsResponse
  },
  saveCreateReport: {
    request: zToBackendSaveCreateReportRequest,
    response: zToBackendSaveCreateReportResponse
  },
  saveModifyReport: {
    request: zToBackendSaveModifyReportRequest,
    response: zToBackendSaveModifyReportResponse
  },
  commitRepo: {
    request: zToBackendCommitRepoRequest,
    response: zToBackendCommitRepoResponse
  },
  getRepo: {
    request: zToBackendGetRepoRequest,
    response: zToBackendGetRepoResponse
  },
  mergeRepo: {
    request: zToBackendMergeRepoRequest,
    response: zToBackendMergeRepoResponse
  },
  pullRepo: {
    request: zToBackendPullRepoRequest,
    response: zToBackendPullRepoResponse
  },
  pushRepo: {
    request: zToBackendPushRepoRequest,
    response: zToBackendPushRepoResponse
  },
  revertRepoToLastCommit: {
    request: zToBackendRevertRepoToLastCommitRequest,
    response: zToBackendRevertRepoToLastCommitResponse
  },
  revertRepoToRemote: {
    request: zToBackendRevertRepoToRemoteRequest,
    response: zToBackendRevertRepoToRemoteResponse
  },
  syncRepo: {
    request: zToBackendSyncRepoRequest,
    response: zToBackendSyncRepoResponse
  },
  createRole: {
    request: zToBackendCreateRoleRequest,
    response: zToBackendCreateRoleResponse
  },
  createRoleGiven: {
    request: zToBackendCreateRoleGivenRequest,
    response: zToBackendCreateRoleGivenResponse
  },
  deleteRole: {
    request: zToBackendDeleteRoleRequest,
    response: zToBackendDeleteRoleResponse
  },
  deleteRoleGiven: {
    request: zToBackendDeleteRoleGivenRequest,
    response: zToBackendDeleteRoleGivenResponse
  },
  editRoleGiven: {
    request: zToBackendEditRoleGivenRequest,
    response: zToBackendEditRoleGivenResponse
  },
  getRoles: {
    request: zToBackendGetRolesRequest,
    response: zToBackendGetRolesResponse
  },
  run: { request: zToBackendRunRequest, response: zToBackendRunResponse },
  archiveSession: {
    request: zToBackendArchiveSessionRequest,
    response: zToBackendArchiveSessionResponse
  },
  closeExplorerSessionTab: {
    request: zToBackendCloseExplorerSessionTabRequest,
    response: zToBackendCloseExplorerSessionTabResponse
  },
  createEditorSession: {
    request: zToBackendCreateEditorSessionRequest,
    response: zToBackendCreateEditorSessionResponse
  },
  createExplorerSession: {
    request: zToBackendCreateExplorerSessionRequest,
    response: zToBackendCreateExplorerSessionResponse
  },
  createSessionSseTicket: {
    request: zToBackendCreateSessionSseTicketRequest,
    response: zToBackendCreateSessionSseTicketResponse
  },
  deleteSession: {
    request: zToBackendDeleteSessionRequest,
    response: zToBackendDeleteSessionResponse
  },
  getSession: {
    request: zToBackendGetSessionRequest,
    response: zToBackendGetSessionResponse
  },
  getSessionsList: {
    request: zToBackendGetSessionsListRequest,
    response: zToBackendGetSessionsListResponse
  },
  pauseEditorSession: {
    request: zToBackendPauseEditorSessionRequest,
    response: zToBackendPauseEditorSessionResponse
  },
  sendMessageToEditorSession: {
    request: zToBackendSendMessageToEditorSessionRequest,
    response: zToBackendSendMessageToEditorSessionResponse
  },
  sendMessageToExplorerSession: {
    request: zToBackendSendMessageToExplorerSessionRequest,
    response: zToBackendSendMessageToExplorerSessionResponse
  },
  setSessionTitle: {
    request: zToBackendSetSessionTitleRequest,
    response: zToBackendSetSessionTitleResponse
  },
  getSkills: {
    request: zToBackendGetSkillsRequest,
    response: zToBackendGetSkillsResponse
  },
  specialRebuildStructs: {
    request: zToBackendSpecialRebuildStructsRequest,
    response: zToBackendSpecialRebuildStructsResponse
  },
  getState: {
    request: zToBackendGetStateRequest,
    response: zToBackendGetStateResponse
  },
  getStruct: {
    request: zToBackendGetStructRequest,
    response: zToBackendGetStructResponse
  },
  getSuggestFields: {
    request: zToBackendGetSuggestFieldsRequest,
    response: zToBackendGetSuggestFieldsResponse
  },
  cloneTestRepo: {
    request: zToBackendCloneTestRepoRequest,
    response: zToBackendCloneTestRepoResponse
  },
  deleteRecords: {
    request: zToBackendDeleteRecordsRequest,
    response: zToBackendDeleteRecordsResponse
  },
  getRebuildStruct: {
    request: zToBackendGetRebuildStructRequest,
    response: zToBackendGetRebuildStructResponse
  },
  seedRecords: {
    request: zToBackendSeedRecordsRequest,
    response: zToBackendSeedRecordsResponse
  },
  completeUserRegistration: {
    request: zToBackendCompleteUserRegistrationRequest,
    response: zToBackendCompleteUserRegistrationResponse
  },
  confirmUserEmail: {
    request: zToBackendConfirmUserEmailRequest,
    response: zToBackendConfirmUserEmailResponse
  },
  deleteUser: {
    request: zToBackendDeleteUserRequest,
    response: zToBackendDeleteUserResponse
  },
  deleteUserApiKey: {
    request: zToBackendDeleteUserApiKeyRequest,
    response: zToBackendDeleteUserApiKeyResponse
  },
  deleteUserCodexAuth: {
    request: zToBackendDeleteUserCodexAuthRequest,
    response: zToBackendDeleteUserCodexAuthResponse
  },
  generateUserApiKey: {
    request: zToBackendGenerateUserApiKeyRequest,
    response: zToBackendGenerateUserApiKeyResponse
  },
  getServerUsers: {
    request: zToBackendGetServerUsersRequest,
    response: zToBackendGetServerUsersResponse
  },
  getUserGivens: {
    request: zToBackendGetUserGivensRequest,
    response: zToBackendGetUserGivensResponse
  },
  getUserProfile: {
    request: zToBackendGetUserProfileRequest,
    response: zToBackendGetUserProfileResponse
  },
  loginUser: {
    request: zToBackendLoginUserRequest,
    response: zToBackendLoginUserResponse
  },
  logoutUser: {
    request: zToBackendLogoutUserRequest,
    response: zToBackendLogoutUserResponse
  },
  pollUserCodexAuth: {
    request: zToBackendPollUserCodexAuthRequest,
    response: zToBackendPollUserCodexAuthResponse
  },
  registerUser: {
    request: zToBackendRegisterUserRequest,
    response: zToBackendRegisterUserResponse
  },
  resendUserEmail: {
    request: zToBackendResendUserEmailRequest,
    response: zToBackendResendUserEmailResponse
  },
  resetUserPassword: {
    request: zToBackendResetUserPasswordRequest,
    response: zToBackendResetUserPasswordResponse
  },
  setUserName: {
    request: zToBackendSetUserNameRequest,
    response: zToBackendSetUserNameResponse
  },
  setUserUi: {
    request: zToBackendSetUserUiRequest,
    response: zToBackendSetUserUiResponse
  },
  startUserCodexAuth: {
    request: zToBackendStartUserCodexAuthRequest,
    response: zToBackendStartUserCodexAuthResponse
  },
  updateUserPassword: {
    request: zToBackendUpdateUserPasswordRequest,
    response: zToBackendUpdateUserPasswordResponse
  }
} satisfies {
  [TOperation in ToBackendOperation]: {
    request: z.ZodType<ToBackendOperationRegistry[TOperation]['request']>;
    response: z.ZodType<ToBackendOperationRegistry[TOperation]['response']>;
  };
};

assertTypesEqual<
  ToBackendOperationRegistry,
  {
    [TOperation in ToBackendOperation]: {
      request: z.infer<
        (typeof zToBackendOperationRegistry)[TOperation]['request']
      >;
      response: z.infer<
        (typeof zToBackendOperationRegistry)[TOperation]['response']
      >;
    };
  }
>({ value: true });
