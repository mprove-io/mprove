import {
  type ToBackendGetAvatarBigRequest,
  zToBackendGetAvatarBigRequest
} from '#common/zod/backend/routes/avatars/get-avatar-big/get-avatar-big-request';
import {
  type ToBackendGetAvatarBigResponse,
  zToBackendGetAvatarBigResponse
} from '#common/zod/backend/routes/avatars/get-avatar-big/get-avatar-big-response';
import {
  type ToBackendSetAvatarRequest,
  zToBackendSetAvatarRequest
} from '#common/zod/backend/routes/avatars/set-avatar/set-avatar-request';
import {
  type ToBackendSetAvatarResponse,
  zToBackendSetAvatarResponse
} from '#common/zod/backend/routes/avatars/set-avatar/set-avatar-response';
import {
  type ToBackendCreateBranchRequest,
  zToBackendCreateBranchRequest
} from '#common/zod/backend/routes/branches/create-branch/create-branch-request';
import {
  type ToBackendCreateBranchResponse,
  zToBackendCreateBranchResponse
} from '#common/zod/backend/routes/branches/create-branch/create-branch-response';
import {
  type ToBackendDeleteBranchRequest,
  zToBackendDeleteBranchRequest
} from '#common/zod/backend/routes/branches/delete-branch/delete-branch-request';
import {
  type ToBackendDeleteBranchResponse,
  zToBackendDeleteBranchResponse
} from '#common/zod/backend/routes/branches/delete-branch/delete-branch-response';
import {
  type ToBackendGetBranchesListRequest,
  zToBackendGetBranchesListRequest
} from '#common/zod/backend/routes/branches/get-branches-list/get-branches-list-request';
import {
  type ToBackendGetBranchesListResponse,
  zToBackendGetBranchesListResponse
} from '#common/zod/backend/routes/branches/get-branches-list/get-branches-list-response';
import {
  type ToBackendIsBranchExistRequest,
  zToBackendIsBranchExistRequest
} from '#common/zod/backend/routes/branches/is-branch-exist/is-branch-exist-request';
import {
  type ToBackendIsBranchExistResponse,
  zToBackendIsBranchExistResponse
} from '#common/zod/backend/routes/branches/is-branch-exist/is-branch-exist-response';
import {
  type ToBackendMoveCatalogNodeRequest,
  zToBackendMoveCatalogNodeRequest
} from '#common/zod/backend/routes/catalogs/move-catalog-node/move-catalog-node-request';
import {
  type ToBackendMoveCatalogNodeResponse,
  zToBackendMoveCatalogNodeResponse
} from '#common/zod/backend/routes/catalogs/move-catalog-node/move-catalog-node-response';
import {
  type ToBackendRenameCatalogNodeRequest,
  zToBackendRenameCatalogNodeRequest
} from '#common/zod/backend/routes/catalogs/rename-catalog-node/rename-catalog-node-request';
import {
  type ToBackendRenameCatalogNodeResponse,
  zToBackendRenameCatalogNodeResponse
} from '#common/zod/backend/routes/catalogs/rename-catalog-node/rename-catalog-node-response';
import {
  type ToBackendCreateDraftChartRequest,
  zToBackendCreateDraftChartRequest
} from '#common/zod/backend/routes/charts/create-draft-chart/create-draft-chart-request';
import {
  type ToBackendCreateDraftChartResponse,
  zToBackendCreateDraftChartResponse
} from '#common/zod/backend/routes/charts/create-draft-chart/create-draft-chart-response';
import {
  type ToBackendDeleteChartRequest,
  zToBackendDeleteChartRequest
} from '#common/zod/backend/routes/charts/delete-chart/delete-chart-request';
import {
  type ToBackendDeleteChartResponse,
  zToBackendDeleteChartResponse
} from '#common/zod/backend/routes/charts/delete-chart/delete-chart-response';
import {
  type ToBackendDeleteDraftChartsRequest,
  zToBackendDeleteDraftChartsRequest
} from '#common/zod/backend/routes/charts/delete-draft-charts/delete-draft-charts-request';
import {
  type ToBackendDeleteDraftChartsResponse,
  zToBackendDeleteDraftChartsResponse
} from '#common/zod/backend/routes/charts/delete-draft-charts/delete-draft-charts-response';
import {
  type ToBackendEditDraftChartRequest,
  zToBackendEditDraftChartRequest
} from '#common/zod/backend/routes/charts/edit-draft-chart/edit-draft-chart-request';
import {
  type ToBackendEditDraftChartResponse,
  zToBackendEditDraftChartResponse
} from '#common/zod/backend/routes/charts/edit-draft-chart/edit-draft-chart-response';
import {
  type ToBackendGetChartRequest,
  zToBackendGetChartRequest
} from '#common/zod/backend/routes/charts/get-chart/get-chart-request';
import {
  type ToBackendGetChartResponse,
  zToBackendGetChartResponse
} from '#common/zod/backend/routes/charts/get-chart/get-chart-response';
import {
  type ToBackendGetChartsRequest,
  zToBackendGetChartsRequest
} from '#common/zod/backend/routes/charts/get-charts/get-charts-request';
import {
  type ToBackendGetChartsResponse,
  zToBackendGetChartsResponse
} from '#common/zod/backend/routes/charts/get-charts/get-charts-response';
import {
  type ToBackendGetExplorerChartTabRequest,
  zToBackendGetExplorerChartTabRequest
} from '#common/zod/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-request';
import {
  type ToBackendGetExplorerChartTabResponse,
  zToBackendGetExplorerChartTabResponse
} from '#common/zod/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-response';
import {
  type ToBackendProduceExplorerChartRequest,
  zToBackendProduceExplorerChartRequest
} from '#common/zod/backend/routes/charts/produce-explorer-chart/produce-explorer-chart-request';
import {
  type ToBackendProduceExplorerChartResponse,
  zToBackendProduceExplorerChartResponse
} from '#common/zod/backend/routes/charts/produce-explorer-chart/produce-explorer-chart-response';
import {
  type ToBackendSaveCreateChartRequest,
  zToBackendSaveCreateChartRequest
} from '#common/zod/backend/routes/charts/save-create-chart/save-create-chart-request';
import {
  type ToBackendSaveCreateChartResponse,
  zToBackendSaveCreateChartResponse
} from '#common/zod/backend/routes/charts/save-create-chart/save-create-chart-response';
import {
  type ToBackendSaveModifyChartRequest,
  zToBackendSaveModifyChartRequest
} from '#common/zod/backend/routes/charts/save-modify-chart/save-modify-chart-request';
import {
  type ToBackendSaveModifyChartResponse,
  zToBackendSaveModifyChartResponse
} from '#common/zod/backend/routes/charts/save-modify-chart/save-modify-chart-response';
import {
  type ToBackendCheckSignUpRequest,
  zToBackendCheckSignUpRequest
} from '#common/zod/backend/routes/check/check-sign-up/check-sign-up-request';
import {
  type ToBackendCheckSignUpResponse,
  zToBackendCheckSignUpResponse
} from '#common/zod/backend/routes/check/check-sign-up/check-sign-up-response';
import {
  type ToBackendClearCachedColumnRequest,
  zToBackendClearCachedColumnRequest
} from '#common/zod/backend/routes/connections/clear-cached-column/clear-cached-column-request';
import {
  type ToBackendClearCachedColumnResponse,
  zToBackendClearCachedColumnResponse
} from '#common/zod/backend/routes/connections/clear-cached-column/clear-cached-column-response';
import {
  type ToBackendCreateConnectionRequest,
  zToBackendCreateConnectionRequest
} from '#common/zod/backend/routes/connections/create-connection/create-connection-request';
import {
  type ToBackendCreateConnectionResponse,
  zToBackendCreateConnectionResponse
} from '#common/zod/backend/routes/connections/create-connection/create-connection-response';
import {
  type ToBackendDeleteConnectionRequest,
  zToBackendDeleteConnectionRequest
} from '#common/zod/backend/routes/connections/delete-connection/delete-connection-request';
import {
  type ToBackendDeleteConnectionResponse,
  zToBackendDeleteConnectionResponse
} from '#common/zod/backend/routes/connections/delete-connection/delete-connection-response';
import {
  type ToBackendEditConnectionRequest,
  zToBackendEditConnectionRequest
} from '#common/zod/backend/routes/connections/edit-connection/edit-connection-request';
import {
  type ToBackendEditConnectionResponse,
  zToBackendEditConnectionResponse
} from '#common/zod/backend/routes/connections/edit-connection/edit-connection-response';
import {
  type ToBackendGetCachedColumnsRequest,
  zToBackendGetCachedColumnsRequest
} from '#common/zod/backend/routes/connections/get-cached-columns/get-cached-columns-request';
import {
  type ToBackendGetCachedColumnsResponse,
  zToBackendGetCachedColumnsResponse
} from '#common/zod/backend/routes/connections/get-cached-columns/get-cached-columns-response';
import {
  type ToBackendGetConnectionSampleRequest,
  zToBackendGetConnectionSampleRequest
} from '#common/zod/backend/routes/connections/get-connection-sample/get-connection-sample-request';
import {
  type ToBackendGetConnectionSampleResponse,
  zToBackendGetConnectionSampleResponse
} from '#common/zod/backend/routes/connections/get-connection-sample/get-connection-sample-response';
import {
  type ToBackendGetConnectionSchemasRequest,
  zToBackendGetConnectionSchemasRequest
} from '#common/zod/backend/routes/connections/get-connection-schemas/get-connection-schemas-request';
import {
  type ToBackendGetConnectionSchemasResponse,
  zToBackendGetConnectionSchemasResponse
} from '#common/zod/backend/routes/connections/get-connection-schemas/get-connection-schemas-response';
import {
  type ToBackendGetConnectionsRequest,
  zToBackendGetConnectionsRequest
} from '#common/zod/backend/routes/connections/get-connections/get-connections-request';
import {
  type ToBackendGetConnectionsResponse,
  zToBackendGetConnectionsResponse
} from '#common/zod/backend/routes/connections/get-connections/get-connections-response';
import {
  type ToBackendGetConnectionsListRequest,
  zToBackendGetConnectionsListRequest
} from '#common/zod/backend/routes/connections/get-connections-list/get-connections-list-request';
import {
  type ToBackendGetConnectionsListResponse,
  zToBackendGetConnectionsListResponse
} from '#common/zod/backend/routes/connections/get-connections-list/get-connections-list-response';
import {
  type ToBackendRefreshCachedColumnRequest,
  zToBackendRefreshCachedColumnRequest
} from '#common/zod/backend/routes/connections/refresh-cached-column/refresh-cached-column-request';
import {
  type ToBackendRefreshCachedColumnResponse,
  zToBackendRefreshCachedColumnResponse
} from '#common/zod/backend/routes/connections/refresh-cached-column/refresh-cached-column-response';
import {
  type ToBackendTestConnectionRequest,
  zToBackendTestConnectionRequest
} from '#common/zod/backend/routes/connections/test-connection/test-connection-request';
import {
  type ToBackendTestConnectionResponse,
  zToBackendTestConnectionResponse
} from '#common/zod/backend/routes/connections/test-connection/test-connection-response';
import {
  type ToBackendViewCachedColumnRequest,
  zToBackendViewCachedColumnRequest
} from '#common/zod/backend/routes/connections/view-cached-column/view-cached-column-request';
import {
  type ToBackendViewCachedColumnResponse,
  zToBackendViewCachedColumnResponse
} from '#common/zod/backend/routes/connections/view-cached-column/view-cached-column-response';
import {
  type ToBackendCreateDraftDashboardRequest,
  zToBackendCreateDraftDashboardRequest
} from '#common/zod/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-request';
import {
  type ToBackendCreateDraftDashboardResponse,
  zToBackendCreateDraftDashboardResponse
} from '#common/zod/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-response';
import {
  type ToBackendDeleteDashboardRequest,
  zToBackendDeleteDashboardRequest
} from '#common/zod/backend/routes/dashboards/delete-dashboard/delete-dashboard-request';
import {
  type ToBackendDeleteDashboardResponse,
  zToBackendDeleteDashboardResponse
} from '#common/zod/backend/routes/dashboards/delete-dashboard/delete-dashboard-response';
import {
  type ToBackendDeleteDraftDashboardsRequest,
  zToBackendDeleteDraftDashboardsRequest
} from '#common/zod/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-request';
import {
  type ToBackendDeleteDraftDashboardsResponse,
  zToBackendDeleteDraftDashboardsResponse
} from '#common/zod/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-response';
import {
  type ToBackendEditDraftDashboardRequest,
  zToBackendEditDraftDashboardRequest
} from '#common/zod/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-request';
import {
  type ToBackendEditDraftDashboardResponse,
  zToBackendEditDraftDashboardResponse
} from '#common/zod/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-response';
import {
  type ToBackendGetDashboardRequest,
  zToBackendGetDashboardRequest
} from '#common/zod/backend/routes/dashboards/get-dashboard/get-dashboard-request';
import {
  type ToBackendGetDashboardResponse,
  zToBackendGetDashboardResponse
} from '#common/zod/backend/routes/dashboards/get-dashboard/get-dashboard-response';
import {
  type ToBackendGetDashboardsRequest,
  zToBackendGetDashboardsRequest
} from '#common/zod/backend/routes/dashboards/get-dashboards/get-dashboards-request';
import {
  type ToBackendGetDashboardsResponse,
  zToBackendGetDashboardsResponse
} from '#common/zod/backend/routes/dashboards/get-dashboards/get-dashboards-response';
import {
  type ToBackendSaveCreateDashboardRequest,
  zToBackendSaveCreateDashboardRequest
} from '#common/zod/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-request';
import {
  type ToBackendSaveCreateDashboardResponse,
  zToBackendSaveCreateDashboardResponse
} from '#common/zod/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-response';
import {
  type ToBackendSaveModifyDashboardRequest,
  zToBackendSaveModifyDashboardRequest
} from '#common/zod/backend/routes/dashboards/save-modify-dashboard/save-modify-dashboard-request';
import {
  type ToBackendSaveModifyDashboardResponse,
  zToBackendSaveModifyDashboardResponse
} from '#common/zod/backend/routes/dashboards/save-modify-dashboard/save-modify-dashboard-response';
import {
  type ToBackendCreateEnvRequest,
  zToBackendCreateEnvRequest
} from '#common/zod/backend/routes/envs/create-env/create-env-request';
import {
  type ToBackendCreateEnvResponse,
  zToBackendCreateEnvResponse
} from '#common/zod/backend/routes/envs/create-env/create-env-response';
import {
  type ToBackendCreateEnvUserRequest,
  zToBackendCreateEnvUserRequest
} from '#common/zod/backend/routes/envs/create-env-user/create-env-user-request';
import {
  type ToBackendCreateEnvUserResponse,
  zToBackendCreateEnvUserResponse
} from '#common/zod/backend/routes/envs/create-env-user/create-env-user-response';
import {
  type ToBackendCreateEnvVarRequest,
  zToBackendCreateEnvVarRequest
} from '#common/zod/backend/routes/envs/create-env-var/create-env-var-request';
import {
  type ToBackendCreateEnvVarResponse,
  zToBackendCreateEnvVarResponse
} from '#common/zod/backend/routes/envs/create-env-var/create-env-var-response';
import {
  type ToBackendDeleteEnvRequest,
  zToBackendDeleteEnvRequest
} from '#common/zod/backend/routes/envs/delete-env/delete-env-request';
import {
  type ToBackendDeleteEnvResponse,
  zToBackendDeleteEnvResponse
} from '#common/zod/backend/routes/envs/delete-env/delete-env-response';
import {
  type ToBackendDeleteEnvUserRequest,
  zToBackendDeleteEnvUserRequest
} from '#common/zod/backend/routes/envs/delete-env-user/delete-env-user-request';
import {
  type ToBackendDeleteEnvUserResponse,
  zToBackendDeleteEnvUserResponse
} from '#common/zod/backend/routes/envs/delete-env-user/delete-env-user-response';
import {
  type ToBackendDeleteEnvVarRequest,
  zToBackendDeleteEnvVarRequest
} from '#common/zod/backend/routes/envs/delete-env-var/delete-env-var-request';
import {
  type ToBackendDeleteEnvVarResponse,
  zToBackendDeleteEnvVarResponse
} from '#common/zod/backend/routes/envs/delete-env-var/delete-env-var-response';
import {
  type ToBackendEditEnvFallbacksRequest,
  zToBackendEditEnvFallbacksRequest
} from '#common/zod/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-request';
import {
  type ToBackendEditEnvFallbacksResponse,
  zToBackendEditEnvFallbacksResponse
} from '#common/zod/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-response';
import {
  type ToBackendEditEnvVarRequest,
  zToBackendEditEnvVarRequest
} from '#common/zod/backend/routes/envs/edit-env-var/edit-env-var-request';
import {
  type ToBackendEditEnvVarResponse,
  zToBackendEditEnvVarResponse
} from '#common/zod/backend/routes/envs/edit-env-var/edit-env-var-response';
import {
  type ToBackendGetEnvsRequest,
  zToBackendGetEnvsRequest
} from '#common/zod/backend/routes/envs/get-envs/get-envs-request';
import {
  type ToBackendGetEnvsResponse,
  zToBackendGetEnvsResponse
} from '#common/zod/backend/routes/envs/get-envs/get-envs-response';
import {
  type ToBackendGetEnvsListRequest,
  zToBackendGetEnvsListRequest
} from '#common/zod/backend/routes/envs/get-envs-list/get-envs-list-request';
import {
  type ToBackendGetEnvsListResponse,
  zToBackendGetEnvsListResponse
} from '#common/zod/backend/routes/envs/get-envs-list/get-envs-list-response';
import {
  type ToBackendSetFavoriteRequest,
  zToBackendSetFavoriteRequest
} from '#common/zod/backend/routes/favorites/set-favorite/set-favorite-request';
import {
  type ToBackendSetFavoriteResponse,
  zToBackendSetFavoriteResponse
} from '#common/zod/backend/routes/favorites/set-favorite/set-favorite-response';
import {
  type ToBackendCreateFileRequest,
  zToBackendCreateFileRequest
} from '#common/zod/backend/routes/files/create-file/create-file-request';
import {
  type ToBackendCreateFileResponse,
  zToBackendCreateFileResponse
} from '#common/zod/backend/routes/files/create-file/create-file-response';
import {
  type ToBackendDeleteFileRequest,
  zToBackendDeleteFileRequest
} from '#common/zod/backend/routes/files/delete-file/delete-file-request';
import {
  type ToBackendDeleteFileResponse,
  zToBackendDeleteFileResponse
} from '#common/zod/backend/routes/files/delete-file/delete-file-response';
import {
  type ToBackendGetFileRequest,
  zToBackendGetFileRequest
} from '#common/zod/backend/routes/files/get-file/get-file-request';
import {
  type ToBackendGetFileResponse,
  zToBackendGetFileResponse
} from '#common/zod/backend/routes/files/get-file/get-file-response';
import {
  type ToBackendSaveFileRequest,
  zToBackendSaveFileRequest
} from '#common/zod/backend/routes/files/save-file/save-file-request';
import {
  type ToBackendSaveFileResponse,
  zToBackendSaveFileResponse
} from '#common/zod/backend/routes/files/save-file/save-file-response';
import {
  type ToBackendValidateFilesRequest,
  zToBackendValidateFilesRequest
} from '#common/zod/backend/routes/files/validate-files/validate-files-request';
import {
  type ToBackendValidateFilesResponse,
  zToBackendValidateFilesResponse
} from '#common/zod/backend/routes/files/validate-files/validate-files-response';
import {
  type ToBackendCreateFolderRequest,
  zToBackendCreateFolderRequest
} from '#common/zod/backend/routes/folders/create-folder/create-folder-request';
import {
  type ToBackendCreateFolderResponse,
  zToBackendCreateFolderResponse
} from '#common/zod/backend/routes/folders/create-folder/create-folder-response';
import {
  type ToBackendDeleteFolderRequest,
  zToBackendDeleteFolderRequest
} from '#common/zod/backend/routes/folders/delete-folder/delete-folder-request';
import {
  type ToBackendDeleteFolderResponse,
  zToBackendDeleteFolderResponse
} from '#common/zod/backend/routes/folders/delete-folder/delete-folder-response';
import {
  type ToBackendCreateGivenRequest,
  zToBackendCreateGivenRequest
} from '#common/zod/backend/routes/givens/create-given/create-given-request';
import {
  type ToBackendCreateGivenResponse,
  zToBackendCreateGivenResponse
} from '#common/zod/backend/routes/givens/create-given/create-given-response';
import {
  type ToBackendDeleteGivenRequest,
  zToBackendDeleteGivenRequest
} from '#common/zod/backend/routes/givens/delete-given/delete-given-request';
import {
  type ToBackendDeleteGivenResponse,
  zToBackendDeleteGivenResponse
} from '#common/zod/backend/routes/givens/delete-given/delete-given-response';
import {
  type ToBackendEditGivenRequest,
  zToBackendEditGivenRequest
} from '#common/zod/backend/routes/givens/edit-given/edit-given-request';
import {
  type ToBackendEditGivenResponse,
  zToBackendEditGivenResponse
} from '#common/zod/backend/routes/givens/edit-given/edit-given-response';
import {
  type ToBackendGetGivensRequest,
  zToBackendGetGivensRequest
} from '#common/zod/backend/routes/givens/get-givens/get-givens-request';
import {
  type ToBackendGetGivensResponse,
  zToBackendGetGivensResponse
} from '#common/zod/backend/routes/givens/get-givens/get-givens-response';
import {
  type ToBackendCreateLlmModelRequest,
  zToBackendCreateLlmModelRequest
} from '#common/zod/backend/routes/llm-models/create-llm-model/create-llm-model-request';
import {
  type ToBackendCreateLlmModelResponse,
  zToBackendCreateLlmModelResponse
} from '#common/zod/backend/routes/llm-models/create-llm-model/create-llm-model-response';
import {
  type ToBackendDeleteLlmModelRequest,
  zToBackendDeleteLlmModelRequest
} from '#common/zod/backend/routes/llm-models/delete-llm-model/delete-llm-model-request';
import {
  type ToBackendDeleteLlmModelResponse,
  zToBackendDeleteLlmModelResponse
} from '#common/zod/backend/routes/llm-models/delete-llm-model/delete-llm-model-response';
import {
  type ToBackendEditLlmModelRequest,
  zToBackendEditLlmModelRequest
} from '#common/zod/backend/routes/llm-models/edit-llm-model/edit-llm-model-request';
import {
  type ToBackendEditLlmModelResponse,
  zToBackendEditLlmModelResponse
} from '#common/zod/backend/routes/llm-models/edit-llm-model/edit-llm-model-response';
import {
  type ToBackendGetLlmModelPartsRequest,
  zToBackendGetLlmModelPartsRequest
} from '#common/zod/backend/routes/llm-models/get-llm-model-parts/get-llm-model-parts-request';
import {
  type ToBackendGetLlmModelPartsResponse,
  zToBackendGetLlmModelPartsResponse
} from '#common/zod/backend/routes/llm-models/get-llm-model-parts/get-llm-model-parts-response';
import {
  type ToBackendGetLlmModelsWithProviderRequest,
  zToBackendGetLlmModelsWithProviderRequest
} from '#common/zod/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-request';
import {
  type ToBackendGetLlmModelsWithProviderResponse,
  zToBackendGetLlmModelsWithProviderResponse
} from '#common/zod/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-response';
import {
  type ToBackendDuplicateMconfigAndQueryRequest,
  zToBackendDuplicateMconfigAndQueryRequest
} from '#common/zod/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-request';
import {
  type ToBackendDuplicateMconfigAndQueryResponse,
  zToBackendDuplicateMconfigAndQueryResponse
} from '#common/zod/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-response';
import {
  type ToBackendGroupMetricByDimensionRequest,
  zToBackendGroupMetricByDimensionRequest
} from '#common/zod/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-request';
import {
  type ToBackendGroupMetricByDimensionResponse,
  zToBackendGroupMetricByDimensionResponse
} from '#common/zod/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-response';
import {
  type ToBackendSuggestDimensionValuesRequest,
  zToBackendSuggestDimensionValuesRequest
} from '#common/zod/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-request';
import {
  type ToBackendSuggestDimensionValuesResponse,
  zToBackendSuggestDimensionValuesResponse
} from '#common/zod/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-response';
import {
  type ToBackendCreateMemberRequest,
  zToBackendCreateMemberRequest
} from '#common/zod/backend/routes/members/create-member/create-member-request';
import {
  type ToBackendCreateMemberResponse,
  zToBackendCreateMemberResponse
} from '#common/zod/backend/routes/members/create-member/create-member-response';
import {
  type ToBackendDeleteMemberRequest,
  zToBackendDeleteMemberRequest
} from '#common/zod/backend/routes/members/delete-member/delete-member-request';
import {
  type ToBackendDeleteMemberResponse,
  zToBackendDeleteMemberResponse
} from '#common/zod/backend/routes/members/delete-member/delete-member-response';
import {
  type ToBackendEditMemberRequest,
  zToBackendEditMemberRequest
} from '#common/zod/backend/routes/members/edit-member/edit-member-request';
import {
  type ToBackendEditMemberResponse,
  zToBackendEditMemberResponse
} from '#common/zod/backend/routes/members/edit-member/edit-member-response';
import {
  type ToBackendGetMemberGivensRequest,
  zToBackendGetMemberGivensRequest
} from '#common/zod/backend/routes/members/get-member-givens/get-member-givens-request';
import {
  type ToBackendGetMemberGivensResponse,
  zToBackendGetMemberGivensResponse
} from '#common/zod/backend/routes/members/get-member-givens/get-member-givens-response';
import {
  type ToBackendGetMembersRequest,
  zToBackendGetMembersRequest
} from '#common/zod/backend/routes/members/get-members/get-members-request';
import {
  type ToBackendGetMembersResponse,
  zToBackendGetMembersResponse
} from '#common/zod/backend/routes/members/get-members/get-members-response';
import {
  type ToBackendGetMembersListRequest,
  zToBackendGetMembersListRequest
} from '#common/zod/backend/routes/members/get-members-list/get-members-list-request';
import {
  type ToBackendGetMembersListResponse,
  zToBackendGetMembersListResponse
} from '#common/zod/backend/routes/members/get-members-list/get-members-list-response';
import {
  type ToBackendGetModelRequest,
  zToBackendGetModelRequest
} from '#common/zod/backend/routes/models/get-model/get-model-request';
import {
  type ToBackendGetModelResponse,
  zToBackendGetModelResponse
} from '#common/zod/backend/routes/models/get-model/get-model-response';
import {
  type ToBackendGetModelsRequest,
  zToBackendGetModelsRequest
} from '#common/zod/backend/routes/models/get-models/get-models-request';
import {
  type ToBackendGetModelsResponse,
  zToBackendGetModelsResponse
} from '#common/zod/backend/routes/models/get-models/get-models-response';
import {
  type ToBackendCheckLastNavRequest,
  zToBackendCheckLastNavRequest
} from '#common/zod/backend/routes/nav/check-last-nav/check-last-nav-request';
import {
  type ToBackendCheckLastNavResponse,
  zToBackendCheckLastNavResponse
} from '#common/zod/backend/routes/nav/check-last-nav/check-last-nav-response';
import {
  type ToBackendGetNavRequest,
  zToBackendGetNavRequest
} from '#common/zod/backend/routes/nav/get-nav/get-nav-request';
import {
  type ToBackendGetNavResponse,
  zToBackendGetNavResponse
} from '#common/zod/backend/routes/nav/get-nav/get-nav-response';
import {
  type ToBackendGetOrgUsersRequest,
  zToBackendGetOrgUsersRequest
} from '#common/zod/backend/routes/org-users/get-org-users/get-org-users-request';
import {
  type ToBackendGetOrgUsersResponse,
  zToBackendGetOrgUsersResponse
} from '#common/zod/backend/routes/org-users/get-org-users/get-org-users-response';
import {
  type ToBackendCreateOrgRequest,
  zToBackendCreateOrgRequest
} from '#common/zod/backend/routes/orgs/create-org/create-org-request';
import {
  type ToBackendCreateOrgResponse,
  zToBackendCreateOrgResponse
} from '#common/zod/backend/routes/orgs/create-org/create-org-response';
import {
  type ToBackendDeleteOrgRequest,
  zToBackendDeleteOrgRequest
} from '#common/zod/backend/routes/orgs/delete-org/delete-org-request';
import {
  type ToBackendDeleteOrgResponse,
  zToBackendDeleteOrgResponse
} from '#common/zod/backend/routes/orgs/delete-org/delete-org-response';
import {
  type ToBackendGetOrgRequest,
  zToBackendGetOrgRequest
} from '#common/zod/backend/routes/orgs/get-org/get-org-request';
import {
  type ToBackendGetOrgResponse,
  zToBackendGetOrgResponse
} from '#common/zod/backend/routes/orgs/get-org/get-org-response';
import {
  type ToBackendGetOrgsListRequest,
  zToBackendGetOrgsListRequest
} from '#common/zod/backend/routes/orgs/get-orgs-list/get-orgs-list-request';
import {
  type ToBackendGetOrgsListResponse,
  zToBackendGetOrgsListResponse
} from '#common/zod/backend/routes/orgs/get-orgs-list/get-orgs-list-response';
import {
  type ToBackendIsOrgExistRequest,
  zToBackendIsOrgExistRequest
} from '#common/zod/backend/routes/orgs/is-org-exist/is-org-exist-request';
import {
  type ToBackendIsOrgExistResponse,
  zToBackendIsOrgExistResponse
} from '#common/zod/backend/routes/orgs/is-org-exist/is-org-exist-response';
import {
  type ToBackendSetOrgInfoRequest,
  zToBackendSetOrgInfoRequest
} from '#common/zod/backend/routes/orgs/set-org-info/set-org-info-request';
import {
  type ToBackendSetOrgInfoResponse,
  zToBackendSetOrgInfoResponse
} from '#common/zod/backend/routes/orgs/set-org-info/set-org-info-response';
import {
  type ToBackendSetOrgOwnerRequest,
  zToBackendSetOrgOwnerRequest
} from '#common/zod/backend/routes/orgs/set-org-owner/set-org-owner-request';
import {
  type ToBackendSetOrgOwnerResponse,
  zToBackendSetOrgOwnerResponse
} from '#common/zod/backend/routes/orgs/set-org-owner/set-org-owner-response';
import {
  type ToBackendCreateProjectRequest,
  zToBackendCreateProjectRequest
} from '#common/zod/backend/routes/projects/create-project/create-project-request';
import {
  type ToBackendCreateProjectResponse,
  zToBackendCreateProjectResponse
} from '#common/zod/backend/routes/projects/create-project/create-project-response';
import {
  type ToBackendDeleteProjectRequest,
  zToBackendDeleteProjectRequest
} from '#common/zod/backend/routes/projects/delete-project/delete-project-request';
import {
  type ToBackendDeleteProjectResponse,
  zToBackendDeleteProjectResponse
} from '#common/zod/backend/routes/projects/delete-project/delete-project-response';
import {
  type ToBackendGenerateProjectRemoteKeyRequest,
  zToBackendGenerateProjectRemoteKeyRequest
} from '#common/zod/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-request';
import {
  type ToBackendGenerateProjectRemoteKeyResponse,
  zToBackendGenerateProjectRemoteKeyResponse
} from '#common/zod/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-response';
import {
  type ToBackendGetProjectRequest,
  zToBackendGetProjectRequest
} from '#common/zod/backend/routes/projects/get-project/get-project-request';
import {
  type ToBackendGetProjectResponse,
  zToBackendGetProjectResponse
} from '#common/zod/backend/routes/projects/get-project/get-project-response';
import {
  type ToBackendGetProjectsListRequest,
  zToBackendGetProjectsListRequest
} from '#common/zod/backend/routes/projects/get-projects-list/get-projects-list-request';
import {
  type ToBackendGetProjectsListResponse,
  zToBackendGetProjectsListResponse
} from '#common/zod/backend/routes/projects/get-projects-list/get-projects-list-response';
import {
  type ToBackendIsProjectExistRequest,
  zToBackendIsProjectExistRequest
} from '#common/zod/backend/routes/projects/is-project-exist/is-project-exist-request';
import {
  type ToBackendIsProjectExistResponse,
  zToBackendIsProjectExistResponse
} from '#common/zod/backend/routes/projects/is-project-exist/is-project-exist-response';
import {
  type ToBackendSetProjectAllowTimezonesRequest,
  zToBackendSetProjectAllowTimezonesRequest
} from '#common/zod/backend/routes/projects/set-project-allow-timezones/set-project-allow-timezones-request';
import {
  type ToBackendSetProjectAllowTimezonesResponse,
  zToBackendSetProjectAllowTimezonesResponse
} from '#common/zod/backend/routes/projects/set-project-allow-timezones/set-project-allow-timezones-response';
import {
  type ToBackendSetProjectInfoRequest,
  zToBackendSetProjectInfoRequest
} from '#common/zod/backend/routes/projects/set-project-info/set-project-info-request';
import {
  type ToBackendSetProjectInfoResponse,
  zToBackendSetProjectInfoResponse
} from '#common/zod/backend/routes/projects/set-project-info/set-project-info-response';
import {
  type ToBackendSetProjectSandboxProviderRequest,
  zToBackendSetProjectSandboxProviderRequest
} from '#common/zod/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-request';
import {
  type ToBackendSetProjectSandboxProviderResponse,
  zToBackendSetProjectSandboxProviderResponse
} from '#common/zod/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-response';
import {
  type ToBackendSetProjectTimezoneRequest,
  zToBackendSetProjectTimezoneRequest
} from '#common/zod/backend/routes/projects/set-project-timezone/set-project-timezone-request';
import {
  type ToBackendSetProjectTimezoneResponse,
  zToBackendSetProjectTimezoneResponse
} from '#common/zod/backend/routes/projects/set-project-timezone/set-project-timezone-response';
import {
  type ToBackendSetProjectWeekStartRequest,
  zToBackendSetProjectWeekStartRequest
} from '#common/zod/backend/routes/projects/set-project-week-start/set-project-week-start-request';
import {
  type ToBackendSetProjectWeekStartResponse,
  zToBackendSetProjectWeekStartResponse
} from '#common/zod/backend/routes/projects/set-project-week-start/set-project-week-start-response';
import {
  type ToBackendCreateProviderRequest,
  zToBackendCreateProviderRequest
} from '#common/zod/backend/routes/providers/create-provider/create-provider-request';
import {
  type ToBackendCreateProviderResponse,
  zToBackendCreateProviderResponse
} from '#common/zod/backend/routes/providers/create-provider/create-provider-response';
import {
  type ToBackendDeleteProviderRequest,
  zToBackendDeleteProviderRequest
} from '#common/zod/backend/routes/providers/delete-provider/delete-provider-request';
import {
  type ToBackendDeleteProviderResponse,
  zToBackendDeleteProviderResponse
} from '#common/zod/backend/routes/providers/delete-provider/delete-provider-response';
import {
  type ToBackendEditProviderRequest,
  zToBackendEditProviderRequest
} from '#common/zod/backend/routes/providers/edit-provider/edit-provider-request';
import {
  type ToBackendEditProviderResponse,
  zToBackendEditProviderResponse
} from '#common/zod/backend/routes/providers/edit-provider/edit-provider-response';
import {
  type ToBackendGetProvidersRequest,
  zToBackendGetProvidersRequest
} from '#common/zod/backend/routes/providers/get-providers/get-providers-request';
import {
  type ToBackendGetProvidersResponse,
  zToBackendGetProvidersResponse
} from '#common/zod/backend/routes/providers/get-providers/get-providers-response';
import {
  type ToBackendToggleProviderRequest,
  zToBackendToggleProviderRequest
} from '#common/zod/backend/routes/providers/toggle-provider/toggle-provider-request';
import {
  type ToBackendToggleProviderResponse,
  zToBackendToggleProviderResponse
} from '#common/zod/backend/routes/providers/toggle-provider/toggle-provider-response';
import {
  type ToBackendCancelQueriesRequest,
  zToBackendCancelQueriesRequest
} from '#common/zod/backend/routes/queries/cancel-queries/cancel-queries-request';
import {
  type ToBackendCancelQueriesResponse,
  zToBackendCancelQueriesResponse
} from '#common/zod/backend/routes/queries/cancel-queries/cancel-queries-response';
import {
  type ToBackendGetQueriesRequest,
  zToBackendGetQueriesRequest
} from '#common/zod/backend/routes/queries/get-queries/get-queries-request';
import {
  type ToBackendGetQueriesResponse,
  zToBackendGetQueriesResponse
} from '#common/zod/backend/routes/queries/get-queries/get-queries-response';
import {
  type ToBackendGetQueryRequest,
  zToBackendGetQueryRequest
} from '#common/zod/backend/routes/queries/get-query/get-query-request';
import {
  type ToBackendGetQueryResponse,
  zToBackendGetQueryResponse
} from '#common/zod/backend/routes/queries/get-query/get-query-response';
import {
  type ToBackendRunQueriesRequest,
  zToBackendRunQueriesRequest
} from '#common/zod/backend/routes/queries/run-queries/run-queries-request';
import {
  type ToBackendRunQueriesResponse,
  zToBackendRunQueriesResponse
} from '#common/zod/backend/routes/queries/run-queries/run-queries-response';
import {
  type ToBackendRunQueriesDryRequest,
  zToBackendRunQueriesDryRequest
} from '#common/zod/backend/routes/queries/run-queries-dry/run-queries-dry-request';
import {
  type ToBackendRunQueriesDryResponse,
  zToBackendRunQueriesDryResponse
} from '#common/zod/backend/routes/queries/run-queries-dry/run-queries-dry-response';
import {
  type ToBackendGetQueryInfoRequest,
  zToBackendGetQueryInfoRequest
} from '#common/zod/backend/routes/query-info/get-query-info/get-query-info-request';
import {
  type ToBackendGetQueryInfoResponse,
  zToBackendGetQueryInfoResponse
} from '#common/zod/backend/routes/query-info/get-query-info/get-query-info-response';
import {
  type ToBackendCreateDraftReportRequest,
  zToBackendCreateDraftReportRequest
} from '#common/zod/backend/routes/reports/create-draft-report/create-draft-report-request';
import {
  type ToBackendCreateDraftReportResponse,
  zToBackendCreateDraftReportResponse
} from '#common/zod/backend/routes/reports/create-draft-report/create-draft-report-response';
import {
  type ToBackendDeleteDraftReportsRequest,
  zToBackendDeleteDraftReportsRequest
} from '#common/zod/backend/routes/reports/delete-draft-reports/delete-draft-reports-request';
import {
  type ToBackendDeleteDraftReportsResponse,
  zToBackendDeleteDraftReportsResponse
} from '#common/zod/backend/routes/reports/delete-draft-reports/delete-draft-reports-response';
import {
  type ToBackendDeleteReportRequest,
  zToBackendDeleteReportRequest
} from '#common/zod/backend/routes/reports/delete-report/delete-report-request';
import {
  type ToBackendDeleteReportResponse,
  zToBackendDeleteReportResponse
} from '#common/zod/backend/routes/reports/delete-report/delete-report-response';
import {
  type ToBackendEditDraftReportRequest,
  zToBackendEditDraftReportRequest
} from '#common/zod/backend/routes/reports/edit-draft-report/edit-draft-report-request';
import {
  type ToBackendEditDraftReportResponse,
  zToBackendEditDraftReportResponse
} from '#common/zod/backend/routes/reports/edit-draft-report/edit-draft-report-response';
import {
  type ToBackendGetReportRequest,
  zToBackendGetReportRequest
} from '#common/zod/backend/routes/reports/get-report/get-report-request';
import {
  type ToBackendGetReportResponse,
  zToBackendGetReportResponse
} from '#common/zod/backend/routes/reports/get-report/get-report-response';
import {
  type ToBackendGetReportsRequest,
  zToBackendGetReportsRequest
} from '#common/zod/backend/routes/reports/get-reports/get-reports-request';
import {
  type ToBackendGetReportsResponse,
  zToBackendGetReportsResponse
} from '#common/zod/backend/routes/reports/get-reports/get-reports-response';
import {
  type ToBackendSaveCreateReportRequest,
  zToBackendSaveCreateReportRequest
} from '#common/zod/backend/routes/reports/save-create-report/save-create-report-request';
import {
  type ToBackendSaveCreateReportResponse,
  zToBackendSaveCreateReportResponse
} from '#common/zod/backend/routes/reports/save-create-report/save-create-report-response';
import {
  type ToBackendSaveModifyReportRequest,
  zToBackendSaveModifyReportRequest
} from '#common/zod/backend/routes/reports/save-modify-report/save-modify-report-request';
import {
  type ToBackendSaveModifyReportResponse,
  zToBackendSaveModifyReportResponse
} from '#common/zod/backend/routes/reports/save-modify-report/save-modify-report-response';
import {
  type ToBackendCommitRepoRequest,
  zToBackendCommitRepoRequest
} from '#common/zod/backend/routes/repos/commit-repo/commit-repo-request';
import {
  type ToBackendCommitRepoResponse,
  zToBackendCommitRepoResponse
} from '#common/zod/backend/routes/repos/commit-repo/commit-repo-response';
import {
  type ToBackendGetRepoRequest,
  zToBackendGetRepoRequest
} from '#common/zod/backend/routes/repos/get-repo/get-repo-request';
import {
  type ToBackendGetRepoResponse,
  zToBackendGetRepoResponse
} from '#common/zod/backend/routes/repos/get-repo/get-repo-response';
import {
  type ToBackendMergeRepoRequest,
  zToBackendMergeRepoRequest
} from '#common/zod/backend/routes/repos/merge-repo/merge-repo-request';
import {
  type ToBackendMergeRepoResponse,
  zToBackendMergeRepoResponse
} from '#common/zod/backend/routes/repos/merge-repo/merge-repo-response';
import {
  type ToBackendPullRepoRequest,
  zToBackendPullRepoRequest
} from '#common/zod/backend/routes/repos/pull-repo/pull-repo-request';
import {
  type ToBackendPullRepoResponse,
  zToBackendPullRepoResponse
} from '#common/zod/backend/routes/repos/pull-repo/pull-repo-response';
import {
  type ToBackendPushRepoRequest,
  zToBackendPushRepoRequest
} from '#common/zod/backend/routes/repos/push-repo/push-repo-request';
import {
  type ToBackendPushRepoResponse,
  zToBackendPushRepoResponse
} from '#common/zod/backend/routes/repos/push-repo/push-repo-response';
import {
  type ToBackendRevertRepoToLastCommitRequest,
  zToBackendRevertRepoToLastCommitRequest
} from '#common/zod/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import {
  type ToBackendRevertRepoToLastCommitResponse,
  zToBackendRevertRepoToLastCommitResponse
} from '#common/zod/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';
import {
  type ToBackendRevertRepoToRemoteRequest,
  zToBackendRevertRepoToRemoteRequest
} from '#common/zod/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-request';
import {
  type ToBackendRevertRepoToRemoteResponse,
  zToBackendRevertRepoToRemoteResponse
} from '#common/zod/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-response';
import {
  type ToBackendSyncRepoRequest,
  zToBackendSyncRepoRequest
} from '#common/zod/backend/routes/repos/sync-repo/sync-repo-request';
import {
  type ToBackendSyncRepoResponse,
  zToBackendSyncRepoResponse
} from '#common/zod/backend/routes/repos/sync-repo/sync-repo-response';
import {
  type ToBackendCreateRoleRequest,
  zToBackendCreateRoleRequest
} from '#common/zod/backend/routes/roles/create-role/create-role-request';
import {
  type ToBackendCreateRoleResponse,
  zToBackendCreateRoleResponse
} from '#common/zod/backend/routes/roles/create-role/create-role-response';
import {
  type ToBackendCreateRoleGivenRequest,
  zToBackendCreateRoleGivenRequest
} from '#common/zod/backend/routes/roles/create-role-given/create-role-given-request';
import {
  type ToBackendCreateRoleGivenResponse,
  zToBackendCreateRoleGivenResponse
} from '#common/zod/backend/routes/roles/create-role-given/create-role-given-response';
import {
  type ToBackendDeleteRoleRequest,
  zToBackendDeleteRoleRequest
} from '#common/zod/backend/routes/roles/delete-role/delete-role-request';
import {
  type ToBackendDeleteRoleResponse,
  zToBackendDeleteRoleResponse
} from '#common/zod/backend/routes/roles/delete-role/delete-role-response';
import {
  type ToBackendDeleteRoleGivenRequest,
  zToBackendDeleteRoleGivenRequest
} from '#common/zod/backend/routes/roles/delete-role-given/delete-role-given-request';
import {
  type ToBackendDeleteRoleGivenResponse,
  zToBackendDeleteRoleGivenResponse
} from '#common/zod/backend/routes/roles/delete-role-given/delete-role-given-response';
import {
  type ToBackendEditRoleGivenRequest,
  zToBackendEditRoleGivenRequest
} from '#common/zod/backend/routes/roles/edit-role-given/edit-role-given-request';
import {
  type ToBackendEditRoleGivenResponse,
  zToBackendEditRoleGivenResponse
} from '#common/zod/backend/routes/roles/edit-role-given/edit-role-given-response';
import {
  type ToBackendGetRolesRequest,
  zToBackendGetRolesRequest
} from '#common/zod/backend/routes/roles/get-roles/get-roles-request';
import {
  type ToBackendGetRolesResponse,
  zToBackendGetRolesResponse
} from '#common/zod/backend/routes/roles/get-roles/get-roles-response';
import {
  type ToBackendRunRequest,
  zToBackendRunRequest
} from '#common/zod/backend/routes/run/run/run-request';
import {
  type ToBackendRunResponse,
  zToBackendRunResponse
} from '#common/zod/backend/routes/run/run/run-response';
import {
  type ToBackendArchiveSessionRequest,
  zToBackendArchiveSessionRequest
} from '#common/zod/backend/routes/sessions/archive-session/archive-session-request';
import {
  type ToBackendArchiveSessionResponse,
  zToBackendArchiveSessionResponse
} from '#common/zod/backend/routes/sessions/archive-session/archive-session-response';
import {
  type ToBackendCloseExplorerSessionTabRequest,
  zToBackendCloseExplorerSessionTabRequest
} from '#common/zod/backend/routes/sessions/close-explorer-session-tab/close-explorer-session-tab-request';
import {
  type ToBackendCloseExplorerSessionTabResponse,
  zToBackendCloseExplorerSessionTabResponse
} from '#common/zod/backend/routes/sessions/close-explorer-session-tab/close-explorer-session-tab-response';
import {
  type ToBackendCreateEditorSessionRequest,
  zToBackendCreateEditorSessionRequest
} from '#common/zod/backend/routes/sessions/create-editor-session/create-editor-session-request';
import {
  type ToBackendCreateEditorSessionResponse,
  zToBackendCreateEditorSessionResponse
} from '#common/zod/backend/routes/sessions/create-editor-session/create-editor-session-response';
import {
  type ToBackendCreateExplorerSessionRequest,
  zToBackendCreateExplorerSessionRequest
} from '#common/zod/backend/routes/sessions/create-explorer-session/create-explorer-session-request';
import {
  type ToBackendCreateExplorerSessionResponse,
  zToBackendCreateExplorerSessionResponse
} from '#common/zod/backend/routes/sessions/create-explorer-session/create-explorer-session-response';
import {
  type ToBackendCreateSessionSseTicketRequest,
  zToBackendCreateSessionSseTicketRequest
} from '#common/zod/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-request';
import {
  type ToBackendCreateSessionSseTicketResponse,
  zToBackendCreateSessionSseTicketResponse
} from '#common/zod/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-response';
import {
  type ToBackendDeleteSessionRequest,
  zToBackendDeleteSessionRequest
} from '#common/zod/backend/routes/sessions/delete-session/delete-session-request';
import {
  type ToBackendDeleteSessionResponse,
  zToBackendDeleteSessionResponse
} from '#common/zod/backend/routes/sessions/delete-session/delete-session-response';
import {
  type ToBackendGetSessionRequest,
  zToBackendGetSessionRequest
} from '#common/zod/backend/routes/sessions/get-session/get-session-request';
import {
  type ToBackendGetSessionResponse,
  zToBackendGetSessionResponse
} from '#common/zod/backend/routes/sessions/get-session/get-session-response';
import {
  type ToBackendGetSessionsListRequest,
  zToBackendGetSessionsListRequest
} from '#common/zod/backend/routes/sessions/get-sessions-list/get-sessions-list-request';
import {
  type ToBackendGetSessionsListResponse,
  zToBackendGetSessionsListResponse
} from '#common/zod/backend/routes/sessions/get-sessions-list/get-sessions-list-response';
import {
  type ToBackendPauseEditorSessionRequest,
  zToBackendPauseEditorSessionRequest
} from '#common/zod/backend/routes/sessions/pause-editor-session/pause-editor-session-request';
import {
  type ToBackendPauseEditorSessionResponse,
  zToBackendPauseEditorSessionResponse
} from '#common/zod/backend/routes/sessions/pause-editor-session/pause-editor-session-response';
import {
  type ToBackendSendMessageToEditorSessionRequest,
  zToBackendSendMessageToEditorSessionRequest
} from '#common/zod/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-request';
import {
  type ToBackendSendMessageToEditorSessionResponse,
  zToBackendSendMessageToEditorSessionResponse
} from '#common/zod/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-response';
import {
  type ToBackendSendMessageToExplorerSessionRequest,
  zToBackendSendMessageToExplorerSessionRequest
} from '#common/zod/backend/routes/sessions/send-message-to-explorer-session/send-message-to-explorer-session-request';
import {
  type ToBackendSendMessageToExplorerSessionResponse,
  zToBackendSendMessageToExplorerSessionResponse
} from '#common/zod/backend/routes/sessions/send-message-to-explorer-session/send-message-to-explorer-session-response';
import {
  type ToBackendSetSessionTitleRequest,
  zToBackendSetSessionTitleRequest
} from '#common/zod/backend/routes/sessions/set-session-title/set-session-title-request';
import {
  type ToBackendSetSessionTitleResponse,
  zToBackendSetSessionTitleResponse
} from '#common/zod/backend/routes/sessions/set-session-title/set-session-title-response';
import {
  type ToBackendGetSkillsRequest,
  zToBackendGetSkillsRequest
} from '#common/zod/backend/routes/skills/get-skills/get-skills-request';
import {
  type ToBackendGetSkillsResponse,
  zToBackendGetSkillsResponse
} from '#common/zod/backend/routes/skills/get-skills/get-skills-response';
import {
  type ToBackendSpecialRebuildStructsRequest,
  zToBackendSpecialRebuildStructsRequest
} from '#common/zod/backend/routes/special/special-rebuild-structs/special-rebuild-structs-request';
import {
  type ToBackendSpecialRebuildStructsResponse,
  zToBackendSpecialRebuildStructsResponse
} from '#common/zod/backend/routes/special/special-rebuild-structs/special-rebuild-structs-response';
import {
  type ToBackendGetStateRequest,
  zToBackendGetStateRequest
} from '#common/zod/backend/routes/state/get-state/get-state-request';
import {
  type ToBackendGetStateResponse,
  zToBackendGetStateResponse
} from '#common/zod/backend/routes/state/get-state/get-state-response';
import {
  type ToBackendGetStructRequest,
  zToBackendGetStructRequest
} from '#common/zod/backend/routes/structs/get-struct/get-struct-request';
import {
  type ToBackendGetStructResponse,
  zToBackendGetStructResponse
} from '#common/zod/backend/routes/structs/get-struct/get-struct-response';
import {
  type ToBackendGetSuggestFieldsRequest,
  zToBackendGetSuggestFieldsRequest
} from '#common/zod/backend/routes/suggest-fields/get-suggest-fields/get-suggest-fields-request';
import {
  type ToBackendGetSuggestFieldsResponse,
  zToBackendGetSuggestFieldsResponse
} from '#common/zod/backend/routes/suggest-fields/get-suggest-fields/get-suggest-fields-response';
import {
  type ToBackendCloneTestRepoRequest,
  zToBackendCloneTestRepoRequest
} from '#common/zod/backend/routes/test-routes/clone-test-repo/clone-test-repo-request';
import {
  type ToBackendCloneTestRepoResponse,
  zToBackendCloneTestRepoResponse
} from '#common/zod/backend/routes/test-routes/clone-test-repo/clone-test-repo-response';
import {
  type ToBackendDeleteRecordsRequest,
  zToBackendDeleteRecordsRequest
} from '#common/zod/backend/routes/test-routes/delete-records/delete-records-request';
import {
  type ToBackendDeleteRecordsResponse,
  zToBackendDeleteRecordsResponse
} from '#common/zod/backend/routes/test-routes/delete-records/delete-records-response';
import {
  type ToBackendGetRebuildStructRequest,
  zToBackendGetRebuildStructRequest
} from '#common/zod/backend/routes/test-routes/get-rebuild-struct/get-rebuild-struct-request';
import {
  type ToBackendGetRebuildStructResponse,
  zToBackendGetRebuildStructResponse
} from '#common/zod/backend/routes/test-routes/get-rebuild-struct/get-rebuild-struct-response';
import {
  type ToBackendSeedRecordsRequest,
  zToBackendSeedRecordsRequest
} from '#common/zod/backend/routes/test-routes/seed-records/seed-records-request';
import {
  type ToBackendSeedRecordsResponse,
  zToBackendSeedRecordsResponse
} from '#common/zod/backend/routes/test-routes/seed-records/seed-records-response';
import {
  type ToBackendCompleteUserRegistrationRequest,
  zToBackendCompleteUserRegistrationRequest
} from '#common/zod/backend/routes/users/complete-user-registration/complete-user-registration-request';
import {
  type ToBackendCompleteUserRegistrationResponse,
  zToBackendCompleteUserRegistrationResponse
} from '#common/zod/backend/routes/users/complete-user-registration/complete-user-registration-response';
import {
  type ToBackendConfirmUserEmailRequest,
  zToBackendConfirmUserEmailRequest
} from '#common/zod/backend/routes/users/confirm-user-email/confirm-user-email-request';
import {
  type ToBackendConfirmUserEmailResponse,
  zToBackendConfirmUserEmailResponse
} from '#common/zod/backend/routes/users/confirm-user-email/confirm-user-email-response';
import {
  type ToBackendDeleteUserRequest,
  zToBackendDeleteUserRequest
} from '#common/zod/backend/routes/users/delete-user/delete-user-request';
import {
  type ToBackendDeleteUserResponse,
  zToBackendDeleteUserResponse
} from '#common/zod/backend/routes/users/delete-user/delete-user-response';
import {
  type ToBackendDeleteUserApiKeyRequest,
  zToBackendDeleteUserApiKeyRequest
} from '#common/zod/backend/routes/users/delete-user-api-key/delete-user-api-key-request';
import {
  type ToBackendDeleteUserApiKeyResponse,
  zToBackendDeleteUserApiKeyResponse
} from '#common/zod/backend/routes/users/delete-user-api-key/delete-user-api-key-response';
import {
  type ToBackendDeleteUserCodexAuthRequest,
  zToBackendDeleteUserCodexAuthRequest
} from '#common/zod/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-request';
import {
  type ToBackendDeleteUserCodexAuthResponse,
  zToBackendDeleteUserCodexAuthResponse
} from '#common/zod/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-response';
import {
  type ToBackendGenerateUserApiKeyRequest,
  zToBackendGenerateUserApiKeyRequest
} from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-request';
import {
  type ToBackendGenerateUserApiKeyResponse,
  zToBackendGenerateUserApiKeyResponse
} from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-response';
import {
  type ToBackendGetServerUsersRequest,
  zToBackendGetServerUsersRequest
} from '#common/zod/backend/routes/users/get-server-users/get-server-users-request';
import {
  type ToBackendGetServerUsersResponse,
  zToBackendGetServerUsersResponse
} from '#common/zod/backend/routes/users/get-server-users/get-server-users-response';
import {
  type ToBackendGetUserGivensRequest,
  zToBackendGetUserGivensRequest
} from '#common/zod/backend/routes/users/get-user-givens/get-user-givens-request';
import {
  type ToBackendGetUserGivensResponse,
  zToBackendGetUserGivensResponse
} from '#common/zod/backend/routes/users/get-user-givens/get-user-givens-response';
import {
  type ToBackendGetUserProfileRequest,
  zToBackendGetUserProfileRequest
} from '#common/zod/backend/routes/users/get-user-profile/get-user-profile-request';
import {
  type ToBackendGetUserProfileResponse,
  zToBackendGetUserProfileResponse
} from '#common/zod/backend/routes/users/get-user-profile/get-user-profile-response';
import {
  type ToBackendLoginUserRequest,
  zToBackendLoginUserRequest
} from '#common/zod/backend/routes/users/login-user/login-user-request';
import {
  type ToBackendLoginUserResponse,
  zToBackendLoginUserResponse
} from '#common/zod/backend/routes/users/login-user/login-user-response';
import {
  type ToBackendLogoutUserRequest,
  zToBackendLogoutUserRequest
} from '#common/zod/backend/routes/users/logout-user/logout-user-request';
import {
  type ToBackendLogoutUserResponse,
  zToBackendLogoutUserResponse
} from '#common/zod/backend/routes/users/logout-user/logout-user-response';
import {
  type ToBackendPollUserCodexAuthRequest,
  zToBackendPollUserCodexAuthRequest
} from '#common/zod/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-request';
import {
  type ToBackendPollUserCodexAuthResponse,
  zToBackendPollUserCodexAuthResponse
} from '#common/zod/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-response';
import {
  type ToBackendRegisterUserRequest,
  zToBackendRegisterUserRequest
} from '#common/zod/backend/routes/users/register-user/register-user-request';
import {
  type ToBackendRegisterUserResponse,
  zToBackendRegisterUserResponse
} from '#common/zod/backend/routes/users/register-user/register-user-response';
import {
  type ToBackendResendUserEmailRequest,
  zToBackendResendUserEmailRequest
} from '#common/zod/backend/routes/users/resend-user-email/resend-user-email-request';
import {
  type ToBackendResendUserEmailResponse,
  zToBackendResendUserEmailResponse
} from '#common/zod/backend/routes/users/resend-user-email/resend-user-email-response';
import {
  type ToBackendResetUserPasswordRequest,
  zToBackendResetUserPasswordRequest
} from '#common/zod/backend/routes/users/reset-user-password/reset-user-password-request';
import {
  type ToBackendResetUserPasswordResponse,
  zToBackendResetUserPasswordResponse
} from '#common/zod/backend/routes/users/reset-user-password/reset-user-password-response';
import {
  type ToBackendSetUserNameRequest,
  zToBackendSetUserNameRequest
} from '#common/zod/backend/routes/users/set-user-name/set-user-name-request';
import {
  type ToBackendSetUserNameResponse,
  zToBackendSetUserNameResponse
} from '#common/zod/backend/routes/users/set-user-name/set-user-name-response';
import {
  type ToBackendSetUserUiRequest,
  zToBackendSetUserUiRequest
} from '#common/zod/backend/routes/users/set-user-ui/set-user-ui-request';
import {
  type ToBackendSetUserUiResponse,
  zToBackendSetUserUiResponse
} from '#common/zod/backend/routes/users/set-user-ui/set-user-ui-response';
import {
  type ToBackendStartUserCodexAuthRequest,
  zToBackendStartUserCodexAuthRequest
} from '#common/zod/backend/routes/users/start-user-codex-auth/start-user-codex-auth-request';
import {
  type ToBackendStartUserCodexAuthResponse,
  zToBackendStartUserCodexAuthResponse
} from '#common/zod/backend/routes/users/start-user-codex-auth/start-user-codex-auth-response';
import {
  type ToBackendUpdateUserPasswordRequest,
  zToBackendUpdateUserPasswordRequest
} from '#common/zod/backend/routes/users/update-user-password/update-user-password-request';
import {
  type ToBackendUpdateUserPasswordResponse,
  zToBackendUpdateUserPasswordResponse
} from '#common/zod/backend/routes/users/update-user-password/update-user-password-response';

export type ToBackendRouteRegistry = {
  'api/ToBackendGetAvatarBig': {
    request: ToBackendGetAvatarBigRequest;
    response: ToBackendGetAvatarBigResponse;
  };
  'api/ToBackendSetAvatar': {
    request: ToBackendSetAvatarRequest;
    response: ToBackendSetAvatarResponse;
  };
  'api/ToBackendCreateBranch': {
    request: ToBackendCreateBranchRequest;
    response: ToBackendCreateBranchResponse;
  };
  'api/ToBackendDeleteBranch': {
    request: ToBackendDeleteBranchRequest;
    response: ToBackendDeleteBranchResponse;
  };
  'api/ToBackendGetBranchesList': {
    request: ToBackendGetBranchesListRequest;
    response: ToBackendGetBranchesListResponse;
  };
  'api/ToBackendIsBranchExist': {
    request: ToBackendIsBranchExistRequest;
    response: ToBackendIsBranchExistResponse;
  };
  'api/ToBackendMoveCatalogNode': {
    request: ToBackendMoveCatalogNodeRequest;
    response: ToBackendMoveCatalogNodeResponse;
  };
  'api/ToBackendRenameCatalogNode': {
    request: ToBackendRenameCatalogNodeRequest;
    response: ToBackendRenameCatalogNodeResponse;
  };
  'api/ToBackendCreateDraftChart': {
    request: ToBackendCreateDraftChartRequest;
    response: ToBackendCreateDraftChartResponse;
  };
  'api/ToBackendDeleteChart': {
    request: ToBackendDeleteChartRequest;
    response: ToBackendDeleteChartResponse;
  };
  'api/ToBackendDeleteDraftCharts': {
    request: ToBackendDeleteDraftChartsRequest;
    response: ToBackendDeleteDraftChartsResponse;
  };
  'api/ToBackendEditDraftChart': {
    request: ToBackendEditDraftChartRequest;
    response: ToBackendEditDraftChartResponse;
  };
  'api/ToBackendGetChart': {
    request: ToBackendGetChartRequest;
    response: ToBackendGetChartResponse;
  };
  'api/ToBackendGetCharts': {
    request: ToBackendGetChartsRequest;
    response: ToBackendGetChartsResponse;
  };
  'api/ToBackendGetExplorerChartTab': {
    request: ToBackendGetExplorerChartTabRequest;
    response: ToBackendGetExplorerChartTabResponse;
  };
  'api/ToBackendProduceExplorerChart': {
    request: ToBackendProduceExplorerChartRequest;
    response: ToBackendProduceExplorerChartResponse;
  };
  'api/ToBackendSaveCreateChart': {
    request: ToBackendSaveCreateChartRequest;
    response: ToBackendSaveCreateChartResponse;
  };
  'api/ToBackendSaveModifyChart': {
    request: ToBackendSaveModifyChartRequest;
    response: ToBackendSaveModifyChartResponse;
  };
  'api/ToBackendCheckSignUp': {
    request: ToBackendCheckSignUpRequest;
    response: ToBackendCheckSignUpResponse;
  };
  'api/ToBackendClearCachedColumn': {
    request: ToBackendClearCachedColumnRequest;
    response: ToBackendClearCachedColumnResponse;
  };
  'api/ToBackendCreateConnection': {
    request: ToBackendCreateConnectionRequest;
    response: ToBackendCreateConnectionResponse;
  };
  'api/ToBackendDeleteConnection': {
    request: ToBackendDeleteConnectionRequest;
    response: ToBackendDeleteConnectionResponse;
  };
  'api/ToBackendEditConnection': {
    request: ToBackendEditConnectionRequest;
    response: ToBackendEditConnectionResponse;
  };
  'api/ToBackendGetCachedColumns': {
    request: ToBackendGetCachedColumnsRequest;
    response: ToBackendGetCachedColumnsResponse;
  };
  'api/ToBackendGetConnectionSample': {
    request: ToBackendGetConnectionSampleRequest;
    response: ToBackendGetConnectionSampleResponse;
  };
  'api/ToBackendGetConnectionSchemas': {
    request: ToBackendGetConnectionSchemasRequest;
    response: ToBackendGetConnectionSchemasResponse;
  };
  'api/ToBackendGetConnectionsList': {
    request: ToBackendGetConnectionsListRequest;
    response: ToBackendGetConnectionsListResponse;
  };
  'api/ToBackendGetConnections': {
    request: ToBackendGetConnectionsRequest;
    response: ToBackendGetConnectionsResponse;
  };
  'api/ToBackendRefreshCachedColumn': {
    request: ToBackendRefreshCachedColumnRequest;
    response: ToBackendRefreshCachedColumnResponse;
  };
  'api/ToBackendTestConnection': {
    request: ToBackendTestConnectionRequest;
    response: ToBackendTestConnectionResponse;
  };
  'api/ToBackendViewCachedColumn': {
    request: ToBackendViewCachedColumnRequest;
    response: ToBackendViewCachedColumnResponse;
  };
  'api/ToBackendCreateDraftDashboard': {
    request: ToBackendCreateDraftDashboardRequest;
    response: ToBackendCreateDraftDashboardResponse;
  };
  'api/ToBackendDeleteDashboard': {
    request: ToBackendDeleteDashboardRequest;
    response: ToBackendDeleteDashboardResponse;
  };
  'api/ToBackendDeleteDraftDashboards': {
    request: ToBackendDeleteDraftDashboardsRequest;
    response: ToBackendDeleteDraftDashboardsResponse;
  };
  'api/ToBackendEditDraftDashboard': {
    request: ToBackendEditDraftDashboardRequest;
    response: ToBackendEditDraftDashboardResponse;
  };
  'api/ToBackendGetDashboard': {
    request: ToBackendGetDashboardRequest;
    response: ToBackendGetDashboardResponse;
  };
  'api/ToBackendGetDashboards': {
    request: ToBackendGetDashboardsRequest;
    response: ToBackendGetDashboardsResponse;
  };
  'api/ToBackendSaveCreateDashboard': {
    request: ToBackendSaveCreateDashboardRequest;
    response: ToBackendSaveCreateDashboardResponse;
  };
  'api/ToBackendSaveModifyDashboard': {
    request: ToBackendSaveModifyDashboardRequest;
    response: ToBackendSaveModifyDashboardResponse;
  };
  'api/ToBackendCreateEnvUser': {
    request: ToBackendCreateEnvUserRequest;
    response: ToBackendCreateEnvUserResponse;
  };
  'api/ToBackendCreateEnvVar': {
    request: ToBackendCreateEnvVarRequest;
    response: ToBackendCreateEnvVarResponse;
  };
  'api/ToBackendCreateEnv': {
    request: ToBackendCreateEnvRequest;
    response: ToBackendCreateEnvResponse;
  };
  'api/ToBackendDeleteEnvUser': {
    request: ToBackendDeleteEnvUserRequest;
    response: ToBackendDeleteEnvUserResponse;
  };
  'api/ToBackendDeleteEnvVar': {
    request: ToBackendDeleteEnvVarRequest;
    response: ToBackendDeleteEnvVarResponse;
  };
  'api/ToBackendDeleteEnv': {
    request: ToBackendDeleteEnvRequest;
    response: ToBackendDeleteEnvResponse;
  };
  'api/ToBackendEditEnvFallbacks': {
    request: ToBackendEditEnvFallbacksRequest;
    response: ToBackendEditEnvFallbacksResponse;
  };
  'api/ToBackendEditEnvVar': {
    request: ToBackendEditEnvVarRequest;
    response: ToBackendEditEnvVarResponse;
  };
  'api/ToBackendGetEnvsList': {
    request: ToBackendGetEnvsListRequest;
    response: ToBackendGetEnvsListResponse;
  };
  'api/ToBackendGetEnvs': {
    request: ToBackendGetEnvsRequest;
    response: ToBackendGetEnvsResponse;
  };
  'api/ToBackendSetFavorite': {
    request: ToBackendSetFavoriteRequest;
    response: ToBackendSetFavoriteResponse;
  };
  'api/ToBackendCreateFile': {
    request: ToBackendCreateFileRequest;
    response: ToBackendCreateFileResponse;
  };
  'api/ToBackendDeleteFile': {
    request: ToBackendDeleteFileRequest;
    response: ToBackendDeleteFileResponse;
  };
  'api/ToBackendGetFile': {
    request: ToBackendGetFileRequest;
    response: ToBackendGetFileResponse;
  };
  'api/ToBackendSaveFile': {
    request: ToBackendSaveFileRequest;
    response: ToBackendSaveFileResponse;
  };
  'api/ToBackendValidateFiles': {
    request: ToBackendValidateFilesRequest;
    response: ToBackendValidateFilesResponse;
  };
  'api/ToBackendCreateFolder': {
    request: ToBackendCreateFolderRequest;
    response: ToBackendCreateFolderResponse;
  };
  'api/ToBackendDeleteFolder': {
    request: ToBackendDeleteFolderRequest;
    response: ToBackendDeleteFolderResponse;
  };
  'api/ToBackendCreateGiven': {
    request: ToBackendCreateGivenRequest;
    response: ToBackendCreateGivenResponse;
  };
  'api/ToBackendDeleteGiven': {
    request: ToBackendDeleteGivenRequest;
    response: ToBackendDeleteGivenResponse;
  };
  'api/ToBackendEditGiven': {
    request: ToBackendEditGivenRequest;
    response: ToBackendEditGivenResponse;
  };
  'api/ToBackendGetGivens': {
    request: ToBackendGetGivensRequest;
    response: ToBackendGetGivensResponse;
  };
  'api/ToBackendDuplicateMconfigAndQuery': {
    request: ToBackendDuplicateMconfigAndQueryRequest;
    response: ToBackendDuplicateMconfigAndQueryResponse;
  };
  'api/ToBackendGroupMetricByDimension': {
    request: ToBackendGroupMetricByDimensionRequest;
    response: ToBackendGroupMetricByDimensionResponse;
  };
  'api/ToBackendSuggestDimensionValues': {
    request: ToBackendSuggestDimensionValuesRequest;
    response: ToBackendSuggestDimensionValuesResponse;
  };
  'api/ToBackendCreateMember': {
    request: ToBackendCreateMemberRequest;
    response: ToBackendCreateMemberResponse;
  };
  'api/ToBackendDeleteMember': {
    request: ToBackendDeleteMemberRequest;
    response: ToBackendDeleteMemberResponse;
  };
  'api/ToBackendEditMember': {
    request: ToBackendEditMemberRequest;
    response: ToBackendEditMemberResponse;
  };
  'api/ToBackendGetMemberGivens': {
    request: ToBackendGetMemberGivensRequest;
    response: ToBackendGetMemberGivensResponse;
  };
  'api/ToBackendGetMembersList': {
    request: ToBackendGetMembersListRequest;
    response: ToBackendGetMembersListResponse;
  };
  'api/ToBackendGetMembers': {
    request: ToBackendGetMembersRequest;
    response: ToBackendGetMembersResponse;
  };
  'api/ToBackendGetModel': {
    request: ToBackendGetModelRequest;
    response: ToBackendGetModelResponse;
  };
  'api/ToBackendGetModels': {
    request: ToBackendGetModelsRequest;
    response: ToBackendGetModelsResponse;
  };
  'api/ToBackendCheckLastNav': {
    request: ToBackendCheckLastNavRequest;
    response: ToBackendCheckLastNavResponse;
  };
  'api/ToBackendGetNav': {
    request: ToBackendGetNavRequest;
    response: ToBackendGetNavResponse;
  };
  'api/ToBackendGetOrgUsers': {
    request: ToBackendGetOrgUsersRequest;
    response: ToBackendGetOrgUsersResponse;
  };
  'api/ToBackendCreateOrg': {
    request: ToBackendCreateOrgRequest;
    response: ToBackendCreateOrgResponse;
  };
  'api/ToBackendDeleteOrg': {
    request: ToBackendDeleteOrgRequest;
    response: ToBackendDeleteOrgResponse;
  };
  'api/ToBackendGetOrg': {
    request: ToBackendGetOrgRequest;
    response: ToBackendGetOrgResponse;
  };
  'api/ToBackendGetOrgsList': {
    request: ToBackendGetOrgsListRequest;
    response: ToBackendGetOrgsListResponse;
  };
  'api/ToBackendIsOrgExist': {
    request: ToBackendIsOrgExistRequest;
    response: ToBackendIsOrgExistResponse;
  };
  'api/ToBackendSetOrgInfo': {
    request: ToBackendSetOrgInfoRequest;
    response: ToBackendSetOrgInfoResponse;
  };
  'api/ToBackendSetOrgOwner': {
    request: ToBackendSetOrgOwnerRequest;
    response: ToBackendSetOrgOwnerResponse;
  };
  'api/ToBackendCreateProject': {
    request: ToBackendCreateProjectRequest;
    response: ToBackendCreateProjectResponse;
  };
  'api/ToBackendDeleteProject': {
    request: ToBackendDeleteProjectRequest;
    response: ToBackendDeleteProjectResponse;
  };
  'api/ToBackendGenerateProjectRemoteKey': {
    request: ToBackendGenerateProjectRemoteKeyRequest;
    response: ToBackendGenerateProjectRemoteKeyResponse;
  };
  'api/ToBackendGetProject': {
    request: ToBackendGetProjectRequest;
    response: ToBackendGetProjectResponse;
  };
  'api/ToBackendGetProjectsList': {
    request: ToBackendGetProjectsListRequest;
    response: ToBackendGetProjectsListResponse;
  };
  'api/ToBackendIsProjectExist': {
    request: ToBackendIsProjectExistRequest;
    response: ToBackendIsProjectExistResponse;
  };
  'api/ToBackendSetProjectAllowTimezones': {
    request: ToBackendSetProjectAllowTimezonesRequest;
    response: ToBackendSetProjectAllowTimezonesResponse;
  };
  'api/ToBackendSetProjectInfo': {
    request: ToBackendSetProjectInfoRequest;
    response: ToBackendSetProjectInfoResponse;
  };
  'api/ToBackendSetProjectSandboxProvider': {
    request: ToBackendSetProjectSandboxProviderRequest;
    response: ToBackendSetProjectSandboxProviderResponse;
  };
  'api/ToBackendSetProjectTimezone': {
    request: ToBackendSetProjectTimezoneRequest;
    response: ToBackendSetProjectTimezoneResponse;
  };
  'api/ToBackendSetProjectWeekStart': {
    request: ToBackendSetProjectWeekStartRequest;
    response: ToBackendSetProjectWeekStartResponse;
  };
  'api/ToBackendCancelQueries': {
    request: ToBackendCancelQueriesRequest;
    response: ToBackendCancelQueriesResponse;
  };
  'api/ToBackendGetQueries': {
    request: ToBackendGetQueriesRequest;
    response: ToBackendGetQueriesResponse;
  };
  'api/ToBackendGetQuery': {
    request: ToBackendGetQueryRequest;
    response: ToBackendGetQueryResponse;
  };
  'api/ToBackendRunQueriesDry': {
    request: ToBackendRunQueriesDryRequest;
    response: ToBackendRunQueriesDryResponse;
  };
  'api/ToBackendRunQueries': {
    request: ToBackendRunQueriesRequest;
    response: ToBackendRunQueriesResponse;
  };
  'api/ToBackendGetQueryInfo': {
    request: ToBackendGetQueryInfoRequest;
    response: ToBackendGetQueryInfoResponse;
  };
  'api/ToBackendCreateDraftReport': {
    request: ToBackendCreateDraftReportRequest;
    response: ToBackendCreateDraftReportResponse;
  };
  'api/ToBackendDeleteDraftReports': {
    request: ToBackendDeleteDraftReportsRequest;
    response: ToBackendDeleteDraftReportsResponse;
  };
  'api/ToBackendDeleteReport': {
    request: ToBackendDeleteReportRequest;
    response: ToBackendDeleteReportResponse;
  };
  'api/ToBackendEditDraftReport': {
    request: ToBackendEditDraftReportRequest;
    response: ToBackendEditDraftReportResponse;
  };
  'api/ToBackendGetReport': {
    request: ToBackendGetReportRequest;
    response: ToBackendGetReportResponse;
  };
  'api/ToBackendGetReports': {
    request: ToBackendGetReportsRequest;
    response: ToBackendGetReportsResponse;
  };
  'api/ToBackendSaveCreateReport': {
    request: ToBackendSaveCreateReportRequest;
    response: ToBackendSaveCreateReportResponse;
  };
  'api/ToBackendSaveModifyReport': {
    request: ToBackendSaveModifyReportRequest;
    response: ToBackendSaveModifyReportResponse;
  };
  'api/ToBackendCommitRepo': {
    request: ToBackendCommitRepoRequest;
    response: ToBackendCommitRepoResponse;
  };
  'api/ToBackendGetRepo': {
    request: ToBackendGetRepoRequest;
    response: ToBackendGetRepoResponse;
  };
  'api/ToBackendMergeRepo': {
    request: ToBackendMergeRepoRequest;
    response: ToBackendMergeRepoResponse;
  };
  'api/ToBackendPullRepo': {
    request: ToBackendPullRepoRequest;
    response: ToBackendPullRepoResponse;
  };
  'api/ToBackendPushRepo': {
    request: ToBackendPushRepoRequest;
    response: ToBackendPushRepoResponse;
  };
  'api/ToBackendRevertRepoToLastCommit': {
    request: ToBackendRevertRepoToLastCommitRequest;
    response: ToBackendRevertRepoToLastCommitResponse;
  };
  'api/ToBackendRevertRepoToRemote': {
    request: ToBackendRevertRepoToRemoteRequest;
    response: ToBackendRevertRepoToRemoteResponse;
  };
  'api/ToBackendSyncRepo': {
    request: ToBackendSyncRepoRequest;
    response: ToBackendSyncRepoResponse;
  };
  'api/ToBackendCreateRoleGiven': {
    request: ToBackendCreateRoleGivenRequest;
    response: ToBackendCreateRoleGivenResponse;
  };
  'api/ToBackendCreateRole': {
    request: ToBackendCreateRoleRequest;
    response: ToBackendCreateRoleResponse;
  };
  'api/ToBackendDeleteRoleGiven': {
    request: ToBackendDeleteRoleGivenRequest;
    response: ToBackendDeleteRoleGivenResponse;
  };
  'api/ToBackendDeleteRole': {
    request: ToBackendDeleteRoleRequest;
    response: ToBackendDeleteRoleResponse;
  };
  'api/ToBackendEditRoleGiven': {
    request: ToBackendEditRoleGivenRequest;
    response: ToBackendEditRoleGivenResponse;
  };
  'api/ToBackendGetRoles': {
    request: ToBackendGetRolesRequest;
    response: ToBackendGetRolesResponse;
  };
  'api/ToBackendRun': {
    request: ToBackendRunRequest;
    response: ToBackendRunResponse;
  };
  'api/ToBackendArchiveSession': {
    request: ToBackendArchiveSessionRequest;
    response: ToBackendArchiveSessionResponse;
  };
  'api/ToBackendCloseExplorerSessionTab': {
    request: ToBackendCloseExplorerSessionTabRequest;
    response: ToBackendCloseExplorerSessionTabResponse;
  };
  'api/ToBackendCreateEditorSession': {
    request: ToBackendCreateEditorSessionRequest;
    response: ToBackendCreateEditorSessionResponse;
  };
  'api/ToBackendCreateExplorerSession': {
    request: ToBackendCreateExplorerSessionRequest;
    response: ToBackendCreateExplorerSessionResponse;
  };
  'api/ToBackendCreateSessionSseTicket': {
    request: ToBackendCreateSessionSseTicketRequest;
    response: ToBackendCreateSessionSseTicketResponse;
  };
  'api/ToBackendDeleteSession': {
    request: ToBackendDeleteSessionRequest;
    response: ToBackendDeleteSessionResponse;
  };
  'api/ToBackendGetSession': {
    request: ToBackendGetSessionRequest;
    response: ToBackendGetSessionResponse;
  };
  'api/ToBackendGetSessionsList': {
    request: ToBackendGetSessionsListRequest;
    response: ToBackendGetSessionsListResponse;
  };
  'api/ToBackendPauseEditorSession': {
    request: ToBackendPauseEditorSessionRequest;
    response: ToBackendPauseEditorSessionResponse;
  };
  'api/ToBackendSendMessageToEditorSession': {
    request: ToBackendSendMessageToEditorSessionRequest;
    response: ToBackendSendMessageToEditorSessionResponse;
  };
  'api/ToBackendSendMessageToExplorerSession': {
    request: ToBackendSendMessageToExplorerSessionRequest;
    response: ToBackendSendMessageToExplorerSessionResponse;
  };
  'api/ToBackendSetSessionTitle': {
    request: ToBackendSetSessionTitleRequest;
    response: ToBackendSetSessionTitleResponse;
  };
  'api/ToBackendGetSkills': {
    request: ToBackendGetSkillsRequest;
    response: ToBackendGetSkillsResponse;
  };
  'api/ToBackendSpecialRebuildStructs': {
    request: ToBackendSpecialRebuildStructsRequest;
    response: ToBackendSpecialRebuildStructsResponse;
  };
  'api/ToBackendGetState': {
    request: ToBackendGetStateRequest;
    response: ToBackendGetStateResponse;
  };
  'api/ToBackendGetStruct': {
    request: ToBackendGetStructRequest;
    response: ToBackendGetStructResponse;
  };
  'api/ToBackendGetSuggestFields': {
    request: ToBackendGetSuggestFieldsRequest;
    response: ToBackendGetSuggestFieldsResponse;
  };
  'api/ToBackendCloneTestRepo': {
    request: ToBackendCloneTestRepoRequest;
    response: ToBackendCloneTestRepoResponse;
  };
  'api/ToBackendDeleteRecords': {
    request: ToBackendDeleteRecordsRequest;
    response: ToBackendDeleteRecordsResponse;
  };
  'api/ToBackendGetRebuildStruct': {
    request: ToBackendGetRebuildStructRequest;
    response: ToBackendGetRebuildStructResponse;
  };
  'api/ToBackendSeedRecords': {
    request: ToBackendSeedRecordsRequest;
    response: ToBackendSeedRecordsResponse;
  };
  'api/ToBackendCompleteUserRegistration': {
    request: ToBackendCompleteUserRegistrationRequest;
    response: ToBackendCompleteUserRegistrationResponse;
  };
  'api/ToBackendConfirmUserEmail': {
    request: ToBackendConfirmUserEmailRequest;
    response: ToBackendConfirmUserEmailResponse;
  };
  'api/ToBackendDeleteUserApiKey': {
    request: ToBackendDeleteUserApiKeyRequest;
    response: ToBackendDeleteUserApiKeyResponse;
  };
  'api/ToBackendDeleteUserCodexAuth': {
    request: ToBackendDeleteUserCodexAuthRequest;
    response: ToBackendDeleteUserCodexAuthResponse;
  };
  'api/ToBackendDeleteUser': {
    request: ToBackendDeleteUserRequest;
    response: ToBackendDeleteUserResponse;
  };
  'api/ToBackendGenerateUserApiKey': {
    request: ToBackendGenerateUserApiKeyRequest;
    response: ToBackendGenerateUserApiKeyResponse;
  };
  'api/ToBackendGetServerUsers': {
    request: ToBackendGetServerUsersRequest;
    response: ToBackendGetServerUsersResponse;
  };
  'api/ToBackendGetUserGivens': {
    request: ToBackendGetUserGivensRequest;
    response: ToBackendGetUserGivensResponse;
  };
  'api/ToBackendGetUserProfile': {
    request: ToBackendGetUserProfileRequest;
    response: ToBackendGetUserProfileResponse;
  };
  'api/ToBackendLoginUser': {
    request: ToBackendLoginUserRequest;
    response: ToBackendLoginUserResponse;
  };
  'api/ToBackendLogoutUser': {
    request: ToBackendLogoutUserRequest;
    response: ToBackendLogoutUserResponse;
  };
  'api/ToBackendPollUserCodexAuth': {
    request: ToBackendPollUserCodexAuthRequest;
    response: ToBackendPollUserCodexAuthResponse;
  };
  'api/ToBackendRegisterUser': {
    request: ToBackendRegisterUserRequest;
    response: ToBackendRegisterUserResponse;
  };
  'api/ToBackendResendUserEmail': {
    request: ToBackendResendUserEmailRequest;
    response: ToBackendResendUserEmailResponse;
  };
  'api/ToBackendResetUserPassword': {
    request: ToBackendResetUserPasswordRequest;
    response: ToBackendResetUserPasswordResponse;
  };
  'api/ToBackendSetUserName': {
    request: ToBackendSetUserNameRequest;
    response: ToBackendSetUserNameResponse;
  };
  'api/ToBackendSetUserUi': {
    request: ToBackendSetUserUiRequest;
    response: ToBackendSetUserUiResponse;
  };
  'api/ToBackendStartUserCodexAuth': {
    request: ToBackendStartUserCodexAuthRequest;
    response: ToBackendStartUserCodexAuthResponse;
  };
  'api/ToBackendUpdateUserPassword': {
    request: ToBackendUpdateUserPasswordRequest;
    response: ToBackendUpdateUserPasswordResponse;
  };
  'api/ToBackendCreateLlmModel': {
    request: ToBackendCreateLlmModelRequest;
    response: ToBackendCreateLlmModelResponse;
  };
  'api/ToBackendDeleteLlmModel': {
    request: ToBackendDeleteLlmModelRequest;
    response: ToBackendDeleteLlmModelResponse;
  };
  'api/ToBackendEditLlmModel': {
    request: ToBackendEditLlmModelRequest;
    response: ToBackendEditLlmModelResponse;
  };
  'api/ToBackendGetLlmModelParts': {
    request: ToBackendGetLlmModelPartsRequest;
    response: ToBackendGetLlmModelPartsResponse;
  };
  'api/ToBackendGetLlmModelsWithProvider': {
    request: ToBackendGetLlmModelsWithProviderRequest;
    response: ToBackendGetLlmModelsWithProviderResponse;
  };
  'api/ToBackendCreateProvider': {
    request: ToBackendCreateProviderRequest;
    response: ToBackendCreateProviderResponse;
  };
  'api/ToBackendDeleteProvider': {
    request: ToBackendDeleteProviderRequest;
    response: ToBackendDeleteProviderResponse;
  };
  'api/ToBackendEditProvider': {
    request: ToBackendEditProviderRequest;
    response: ToBackendEditProviderResponse;
  };
  'api/ToBackendGetProviders': {
    request: ToBackendGetProvidersRequest;
    response: ToBackendGetProvidersResponse;
  };
  'api/ToBackendToggleProvider': {
    request: ToBackendToggleProviderRequest;
    response: ToBackendToggleProviderResponse;
  };
};

export const toBackendRouteRegistry = {
  'api/ToBackendGetAvatarBig': {
    request: zToBackendGetAvatarBigRequest,
    response: zToBackendGetAvatarBigResponse
  },
  'api/ToBackendSetAvatar': {
    request: zToBackendSetAvatarRequest,
    response: zToBackendSetAvatarResponse
  },
  'api/ToBackendCreateBranch': {
    request: zToBackendCreateBranchRequest,
    response: zToBackendCreateBranchResponse
  },
  'api/ToBackendDeleteBranch': {
    request: zToBackendDeleteBranchRequest,
    response: zToBackendDeleteBranchResponse
  },
  'api/ToBackendGetBranchesList': {
    request: zToBackendGetBranchesListRequest,
    response: zToBackendGetBranchesListResponse
  },
  'api/ToBackendIsBranchExist': {
    request: zToBackendIsBranchExistRequest,
    response: zToBackendIsBranchExistResponse
  },
  'api/ToBackendMoveCatalogNode': {
    request: zToBackendMoveCatalogNodeRequest,
    response: zToBackendMoveCatalogNodeResponse
  },
  'api/ToBackendRenameCatalogNode': {
    request: zToBackendRenameCatalogNodeRequest,
    response: zToBackendRenameCatalogNodeResponse
  },
  'api/ToBackendCreateDraftChart': {
    request: zToBackendCreateDraftChartRequest,
    response: zToBackendCreateDraftChartResponse
  },
  'api/ToBackendDeleteChart': {
    request: zToBackendDeleteChartRequest,
    response: zToBackendDeleteChartResponse
  },
  'api/ToBackendDeleteDraftCharts': {
    request: zToBackendDeleteDraftChartsRequest,
    response: zToBackendDeleteDraftChartsResponse
  },
  'api/ToBackendEditDraftChart': {
    request: zToBackendEditDraftChartRequest,
    response: zToBackendEditDraftChartResponse
  },
  'api/ToBackendGetChart': {
    request: zToBackendGetChartRequest,
    response: zToBackendGetChartResponse
  },
  'api/ToBackendGetCharts': {
    request: zToBackendGetChartsRequest,
    response: zToBackendGetChartsResponse
  },
  'api/ToBackendGetExplorerChartTab': {
    request: zToBackendGetExplorerChartTabRequest,
    response: zToBackendGetExplorerChartTabResponse
  },
  'api/ToBackendProduceExplorerChart': {
    request: zToBackendProduceExplorerChartRequest,
    response: zToBackendProduceExplorerChartResponse
  },
  'api/ToBackendSaveCreateChart': {
    request: zToBackendSaveCreateChartRequest,
    response: zToBackendSaveCreateChartResponse
  },
  'api/ToBackendSaveModifyChart': {
    request: zToBackendSaveModifyChartRequest,
    response: zToBackendSaveModifyChartResponse
  },
  'api/ToBackendCheckSignUp': {
    request: zToBackendCheckSignUpRequest,
    response: zToBackendCheckSignUpResponse
  },
  'api/ToBackendClearCachedColumn': {
    request: zToBackendClearCachedColumnRequest,
    response: zToBackendClearCachedColumnResponse
  },
  'api/ToBackendCreateConnection': {
    request: zToBackendCreateConnectionRequest,
    response: zToBackendCreateConnectionResponse
  },
  'api/ToBackendDeleteConnection': {
    request: zToBackendDeleteConnectionRequest,
    response: zToBackendDeleteConnectionResponse
  },
  'api/ToBackendEditConnection': {
    request: zToBackendEditConnectionRequest,
    response: zToBackendEditConnectionResponse
  },
  'api/ToBackendGetCachedColumns': {
    request: zToBackendGetCachedColumnsRequest,
    response: zToBackendGetCachedColumnsResponse
  },
  'api/ToBackendGetConnectionSample': {
    request: zToBackendGetConnectionSampleRequest,
    response: zToBackendGetConnectionSampleResponse
  },
  'api/ToBackendGetConnectionSchemas': {
    request: zToBackendGetConnectionSchemasRequest,
    response: zToBackendGetConnectionSchemasResponse
  },
  'api/ToBackendGetConnectionsList': {
    request: zToBackendGetConnectionsListRequest,
    response: zToBackendGetConnectionsListResponse
  },
  'api/ToBackendGetConnections': {
    request: zToBackendGetConnectionsRequest,
    response: zToBackendGetConnectionsResponse
  },
  'api/ToBackendRefreshCachedColumn': {
    request: zToBackendRefreshCachedColumnRequest,
    response: zToBackendRefreshCachedColumnResponse
  },
  'api/ToBackendTestConnection': {
    request: zToBackendTestConnectionRequest,
    response: zToBackendTestConnectionResponse
  },
  'api/ToBackendViewCachedColumn': {
    request: zToBackendViewCachedColumnRequest,
    response: zToBackendViewCachedColumnResponse
  },
  'api/ToBackendCreateDraftDashboard': {
    request: zToBackendCreateDraftDashboardRequest,
    response: zToBackendCreateDraftDashboardResponse
  },
  'api/ToBackendDeleteDashboard': {
    request: zToBackendDeleteDashboardRequest,
    response: zToBackendDeleteDashboardResponse
  },
  'api/ToBackendDeleteDraftDashboards': {
    request: zToBackendDeleteDraftDashboardsRequest,
    response: zToBackendDeleteDraftDashboardsResponse
  },
  'api/ToBackendEditDraftDashboard': {
    request: zToBackendEditDraftDashboardRequest,
    response: zToBackendEditDraftDashboardResponse
  },
  'api/ToBackendGetDashboard': {
    request: zToBackendGetDashboardRequest,
    response: zToBackendGetDashboardResponse
  },
  'api/ToBackendGetDashboards': {
    request: zToBackendGetDashboardsRequest,
    response: zToBackendGetDashboardsResponse
  },
  'api/ToBackendSaveCreateDashboard': {
    request: zToBackendSaveCreateDashboardRequest,
    response: zToBackendSaveCreateDashboardResponse
  },
  'api/ToBackendSaveModifyDashboard': {
    request: zToBackendSaveModifyDashboardRequest,
    response: zToBackendSaveModifyDashboardResponse
  },
  'api/ToBackendCreateEnvUser': {
    request: zToBackendCreateEnvUserRequest,
    response: zToBackendCreateEnvUserResponse
  },
  'api/ToBackendCreateEnvVar': {
    request: zToBackendCreateEnvVarRequest,
    response: zToBackendCreateEnvVarResponse
  },
  'api/ToBackendCreateEnv': {
    request: zToBackendCreateEnvRequest,
    response: zToBackendCreateEnvResponse
  },
  'api/ToBackendDeleteEnvUser': {
    request: zToBackendDeleteEnvUserRequest,
    response: zToBackendDeleteEnvUserResponse
  },
  'api/ToBackendDeleteEnvVar': {
    request: zToBackendDeleteEnvVarRequest,
    response: zToBackendDeleteEnvVarResponse
  },
  'api/ToBackendDeleteEnv': {
    request: zToBackendDeleteEnvRequest,
    response: zToBackendDeleteEnvResponse
  },
  'api/ToBackendEditEnvFallbacks': {
    request: zToBackendEditEnvFallbacksRequest,
    response: zToBackendEditEnvFallbacksResponse
  },
  'api/ToBackendEditEnvVar': {
    request: zToBackendEditEnvVarRequest,
    response: zToBackendEditEnvVarResponse
  },
  'api/ToBackendGetEnvsList': {
    request: zToBackendGetEnvsListRequest,
    response: zToBackendGetEnvsListResponse
  },
  'api/ToBackendGetEnvs': {
    request: zToBackendGetEnvsRequest,
    response: zToBackendGetEnvsResponse
  },
  'api/ToBackendSetFavorite': {
    request: zToBackendSetFavoriteRequest,
    response: zToBackendSetFavoriteResponse
  },
  'api/ToBackendCreateFile': {
    request: zToBackendCreateFileRequest,
    response: zToBackendCreateFileResponse
  },
  'api/ToBackendDeleteFile': {
    request: zToBackendDeleteFileRequest,
    response: zToBackendDeleteFileResponse
  },
  'api/ToBackendGetFile': {
    request: zToBackendGetFileRequest,
    response: zToBackendGetFileResponse
  },
  'api/ToBackendSaveFile': {
    request: zToBackendSaveFileRequest,
    response: zToBackendSaveFileResponse
  },
  'api/ToBackendValidateFiles': {
    request: zToBackendValidateFilesRequest,
    response: zToBackendValidateFilesResponse
  },
  'api/ToBackendCreateFolder': {
    request: zToBackendCreateFolderRequest,
    response: zToBackendCreateFolderResponse
  },
  'api/ToBackendDeleteFolder': {
    request: zToBackendDeleteFolderRequest,
    response: zToBackendDeleteFolderResponse
  },
  'api/ToBackendCreateGiven': {
    request: zToBackendCreateGivenRequest,
    response: zToBackendCreateGivenResponse
  },
  'api/ToBackendDeleteGiven': {
    request: zToBackendDeleteGivenRequest,
    response: zToBackendDeleteGivenResponse
  },
  'api/ToBackendEditGiven': {
    request: zToBackendEditGivenRequest,
    response: zToBackendEditGivenResponse
  },
  'api/ToBackendGetGivens': {
    request: zToBackendGetGivensRequest,
    response: zToBackendGetGivensResponse
  },
  'api/ToBackendDuplicateMconfigAndQuery': {
    request: zToBackendDuplicateMconfigAndQueryRequest,
    response: zToBackendDuplicateMconfigAndQueryResponse
  },
  'api/ToBackendGroupMetricByDimension': {
    request: zToBackendGroupMetricByDimensionRequest,
    response: zToBackendGroupMetricByDimensionResponse
  },
  'api/ToBackendSuggestDimensionValues': {
    request: zToBackendSuggestDimensionValuesRequest,
    response: zToBackendSuggestDimensionValuesResponse
  },
  'api/ToBackendCreateMember': {
    request: zToBackendCreateMemberRequest,
    response: zToBackendCreateMemberResponse
  },
  'api/ToBackendDeleteMember': {
    request: zToBackendDeleteMemberRequest,
    response: zToBackendDeleteMemberResponse
  },
  'api/ToBackendEditMember': {
    request: zToBackendEditMemberRequest,
    response: zToBackendEditMemberResponse
  },
  'api/ToBackendGetMemberGivens': {
    request: zToBackendGetMemberGivensRequest,
    response: zToBackendGetMemberGivensResponse
  },
  'api/ToBackendGetMembersList': {
    request: zToBackendGetMembersListRequest,
    response: zToBackendGetMembersListResponse
  },
  'api/ToBackendGetMembers': {
    request: zToBackendGetMembersRequest,
    response: zToBackendGetMembersResponse
  },
  'api/ToBackendGetModel': {
    request: zToBackendGetModelRequest,
    response: zToBackendGetModelResponse
  },
  'api/ToBackendGetModels': {
    request: zToBackendGetModelsRequest,
    response: zToBackendGetModelsResponse
  },
  'api/ToBackendCheckLastNav': {
    request: zToBackendCheckLastNavRequest,
    response: zToBackendCheckLastNavResponse
  },
  'api/ToBackendGetNav': {
    request: zToBackendGetNavRequest,
    response: zToBackendGetNavResponse
  },
  'api/ToBackendGetOrgUsers': {
    request: zToBackendGetOrgUsersRequest,
    response: zToBackendGetOrgUsersResponse
  },
  'api/ToBackendCreateOrg': {
    request: zToBackendCreateOrgRequest,
    response: zToBackendCreateOrgResponse
  },
  'api/ToBackendDeleteOrg': {
    request: zToBackendDeleteOrgRequest,
    response: zToBackendDeleteOrgResponse
  },
  'api/ToBackendGetOrg': {
    request: zToBackendGetOrgRequest,
    response: zToBackendGetOrgResponse
  },
  'api/ToBackendGetOrgsList': {
    request: zToBackendGetOrgsListRequest,
    response: zToBackendGetOrgsListResponse
  },
  'api/ToBackendIsOrgExist': {
    request: zToBackendIsOrgExistRequest,
    response: zToBackendIsOrgExistResponse
  },
  'api/ToBackendSetOrgInfo': {
    request: zToBackendSetOrgInfoRequest,
    response: zToBackendSetOrgInfoResponse
  },
  'api/ToBackendSetOrgOwner': {
    request: zToBackendSetOrgOwnerRequest,
    response: zToBackendSetOrgOwnerResponse
  },
  'api/ToBackendCreateProject': {
    request: zToBackendCreateProjectRequest,
    response: zToBackendCreateProjectResponse
  },
  'api/ToBackendDeleteProject': {
    request: zToBackendDeleteProjectRequest,
    response: zToBackendDeleteProjectResponse
  },
  'api/ToBackendGenerateProjectRemoteKey': {
    request: zToBackendGenerateProjectRemoteKeyRequest,
    response: zToBackendGenerateProjectRemoteKeyResponse
  },
  'api/ToBackendGetProject': {
    request: zToBackendGetProjectRequest,
    response: zToBackendGetProjectResponse
  },
  'api/ToBackendGetProjectsList': {
    request: zToBackendGetProjectsListRequest,
    response: zToBackendGetProjectsListResponse
  },
  'api/ToBackendIsProjectExist': {
    request: zToBackendIsProjectExistRequest,
    response: zToBackendIsProjectExistResponse
  },
  'api/ToBackendSetProjectAllowTimezones': {
    request: zToBackendSetProjectAllowTimezonesRequest,
    response: zToBackendSetProjectAllowTimezonesResponse
  },
  'api/ToBackendSetProjectInfo': {
    request: zToBackendSetProjectInfoRequest,
    response: zToBackendSetProjectInfoResponse
  },
  'api/ToBackendSetProjectSandboxProvider': {
    request: zToBackendSetProjectSandboxProviderRequest,
    response: zToBackendSetProjectSandboxProviderResponse
  },
  'api/ToBackendSetProjectTimezone': {
    request: zToBackendSetProjectTimezoneRequest,
    response: zToBackendSetProjectTimezoneResponse
  },
  'api/ToBackendSetProjectWeekStart': {
    request: zToBackendSetProjectWeekStartRequest,
    response: zToBackendSetProjectWeekStartResponse
  },
  'api/ToBackendCancelQueries': {
    request: zToBackendCancelQueriesRequest,
    response: zToBackendCancelQueriesResponse
  },
  'api/ToBackendGetQueries': {
    request: zToBackendGetQueriesRequest,
    response: zToBackendGetQueriesResponse
  },
  'api/ToBackendGetQuery': {
    request: zToBackendGetQueryRequest,
    response: zToBackendGetQueryResponse
  },
  'api/ToBackendRunQueriesDry': {
    request: zToBackendRunQueriesDryRequest,
    response: zToBackendRunQueriesDryResponse
  },
  'api/ToBackendRunQueries': {
    request: zToBackendRunQueriesRequest,
    response: zToBackendRunQueriesResponse
  },
  'api/ToBackendGetQueryInfo': {
    request: zToBackendGetQueryInfoRequest,
    response: zToBackendGetQueryInfoResponse
  },
  'api/ToBackendCreateDraftReport': {
    request: zToBackendCreateDraftReportRequest,
    response: zToBackendCreateDraftReportResponse
  },
  'api/ToBackendDeleteDraftReports': {
    request: zToBackendDeleteDraftReportsRequest,
    response: zToBackendDeleteDraftReportsResponse
  },
  'api/ToBackendDeleteReport': {
    request: zToBackendDeleteReportRequest,
    response: zToBackendDeleteReportResponse
  },
  'api/ToBackendEditDraftReport': {
    request: zToBackendEditDraftReportRequest,
    response: zToBackendEditDraftReportResponse
  },
  'api/ToBackendGetReport': {
    request: zToBackendGetReportRequest,
    response: zToBackendGetReportResponse
  },
  'api/ToBackendGetReports': {
    request: zToBackendGetReportsRequest,
    response: zToBackendGetReportsResponse
  },
  'api/ToBackendSaveCreateReport': {
    request: zToBackendSaveCreateReportRequest,
    response: zToBackendSaveCreateReportResponse
  },
  'api/ToBackendSaveModifyReport': {
    request: zToBackendSaveModifyReportRequest,
    response: zToBackendSaveModifyReportResponse
  },
  'api/ToBackendCommitRepo': {
    request: zToBackendCommitRepoRequest,
    response: zToBackendCommitRepoResponse
  },
  'api/ToBackendGetRepo': {
    request: zToBackendGetRepoRequest,
    response: zToBackendGetRepoResponse
  },
  'api/ToBackendMergeRepo': {
    request: zToBackendMergeRepoRequest,
    response: zToBackendMergeRepoResponse
  },
  'api/ToBackendPullRepo': {
    request: zToBackendPullRepoRequest,
    response: zToBackendPullRepoResponse
  },
  'api/ToBackendPushRepo': {
    request: zToBackendPushRepoRequest,
    response: zToBackendPushRepoResponse
  },
  'api/ToBackendRevertRepoToLastCommit': {
    request: zToBackendRevertRepoToLastCommitRequest,
    response: zToBackendRevertRepoToLastCommitResponse
  },
  'api/ToBackendRevertRepoToRemote': {
    request: zToBackendRevertRepoToRemoteRequest,
    response: zToBackendRevertRepoToRemoteResponse
  },
  'api/ToBackendSyncRepo': {
    request: zToBackendSyncRepoRequest,
    response: zToBackendSyncRepoResponse
  },
  'api/ToBackendCreateRoleGiven': {
    request: zToBackendCreateRoleGivenRequest,
    response: zToBackendCreateRoleGivenResponse
  },
  'api/ToBackendCreateRole': {
    request: zToBackendCreateRoleRequest,
    response: zToBackendCreateRoleResponse
  },
  'api/ToBackendDeleteRoleGiven': {
    request: zToBackendDeleteRoleGivenRequest,
    response: zToBackendDeleteRoleGivenResponse
  },
  'api/ToBackendDeleteRole': {
    request: zToBackendDeleteRoleRequest,
    response: zToBackendDeleteRoleResponse
  },
  'api/ToBackendEditRoleGiven': {
    request: zToBackendEditRoleGivenRequest,
    response: zToBackendEditRoleGivenResponse
  },
  'api/ToBackendGetRoles': {
    request: zToBackendGetRolesRequest,
    response: zToBackendGetRolesResponse
  },
  'api/ToBackendRun': {
    request: zToBackendRunRequest,
    response: zToBackendRunResponse
  },
  'api/ToBackendArchiveSession': {
    request: zToBackendArchiveSessionRequest,
    response: zToBackendArchiveSessionResponse
  },
  'api/ToBackendCloseExplorerSessionTab': {
    request: zToBackendCloseExplorerSessionTabRequest,
    response: zToBackendCloseExplorerSessionTabResponse
  },
  'api/ToBackendCreateEditorSession': {
    request: zToBackendCreateEditorSessionRequest,
    response: zToBackendCreateEditorSessionResponse
  },
  'api/ToBackendCreateExplorerSession': {
    request: zToBackendCreateExplorerSessionRequest,
    response: zToBackendCreateExplorerSessionResponse
  },
  'api/ToBackendCreateSessionSseTicket': {
    request: zToBackendCreateSessionSseTicketRequest,
    response: zToBackendCreateSessionSseTicketResponse
  },
  'api/ToBackendDeleteSession': {
    request: zToBackendDeleteSessionRequest,
    response: zToBackendDeleteSessionResponse
  },
  'api/ToBackendGetSession': {
    request: zToBackendGetSessionRequest,
    response: zToBackendGetSessionResponse
  },
  'api/ToBackendGetSessionsList': {
    request: zToBackendGetSessionsListRequest,
    response: zToBackendGetSessionsListResponse
  },
  'api/ToBackendPauseEditorSession': {
    request: zToBackendPauseEditorSessionRequest,
    response: zToBackendPauseEditorSessionResponse
  },
  'api/ToBackendSendMessageToEditorSession': {
    request: zToBackendSendMessageToEditorSessionRequest,
    response: zToBackendSendMessageToEditorSessionResponse
  },
  'api/ToBackendSendMessageToExplorerSession': {
    request: zToBackendSendMessageToExplorerSessionRequest,
    response: zToBackendSendMessageToExplorerSessionResponse
  },
  'api/ToBackendSetSessionTitle': {
    request: zToBackendSetSessionTitleRequest,
    response: zToBackendSetSessionTitleResponse
  },
  'api/ToBackendGetSkills': {
    request: zToBackendGetSkillsRequest,
    response: zToBackendGetSkillsResponse
  },
  'api/ToBackendSpecialRebuildStructs': {
    request: zToBackendSpecialRebuildStructsRequest,
    response: zToBackendSpecialRebuildStructsResponse
  },
  'api/ToBackendGetState': {
    request: zToBackendGetStateRequest,
    response: zToBackendGetStateResponse
  },
  'api/ToBackendGetStruct': {
    request: zToBackendGetStructRequest,
    response: zToBackendGetStructResponse
  },
  'api/ToBackendGetSuggestFields': {
    request: zToBackendGetSuggestFieldsRequest,
    response: zToBackendGetSuggestFieldsResponse
  },
  'api/ToBackendCloneTestRepo': {
    request: zToBackendCloneTestRepoRequest,
    response: zToBackendCloneTestRepoResponse
  },
  'api/ToBackendDeleteRecords': {
    request: zToBackendDeleteRecordsRequest,
    response: zToBackendDeleteRecordsResponse
  },
  'api/ToBackendGetRebuildStruct': {
    request: zToBackendGetRebuildStructRequest,
    response: zToBackendGetRebuildStructResponse
  },
  'api/ToBackendSeedRecords': {
    request: zToBackendSeedRecordsRequest,
    response: zToBackendSeedRecordsResponse
  },
  'api/ToBackendCompleteUserRegistration': {
    request: zToBackendCompleteUserRegistrationRequest,
    response: zToBackendCompleteUserRegistrationResponse
  },
  'api/ToBackendConfirmUserEmail': {
    request: zToBackendConfirmUserEmailRequest,
    response: zToBackendConfirmUserEmailResponse
  },
  'api/ToBackendDeleteUserApiKey': {
    request: zToBackendDeleteUserApiKeyRequest,
    response: zToBackendDeleteUserApiKeyResponse
  },
  'api/ToBackendDeleteUserCodexAuth': {
    request: zToBackendDeleteUserCodexAuthRequest,
    response: zToBackendDeleteUserCodexAuthResponse
  },
  'api/ToBackendDeleteUser': {
    request: zToBackendDeleteUserRequest,
    response: zToBackendDeleteUserResponse
  },
  'api/ToBackendGenerateUserApiKey': {
    request: zToBackendGenerateUserApiKeyRequest,
    response: zToBackendGenerateUserApiKeyResponse
  },
  'api/ToBackendGetServerUsers': {
    request: zToBackendGetServerUsersRequest,
    response: zToBackendGetServerUsersResponse
  },
  'api/ToBackendGetUserGivens': {
    request: zToBackendGetUserGivensRequest,
    response: zToBackendGetUserGivensResponse
  },
  'api/ToBackendGetUserProfile': {
    request: zToBackendGetUserProfileRequest,
    response: zToBackendGetUserProfileResponse
  },
  'api/ToBackendLoginUser': {
    request: zToBackendLoginUserRequest,
    response: zToBackendLoginUserResponse
  },
  'api/ToBackendLogoutUser': {
    request: zToBackendLogoutUserRequest,
    response: zToBackendLogoutUserResponse
  },
  'api/ToBackendPollUserCodexAuth': {
    request: zToBackendPollUserCodexAuthRequest,
    response: zToBackendPollUserCodexAuthResponse
  },
  'api/ToBackendRegisterUser': {
    request: zToBackendRegisterUserRequest,
    response: zToBackendRegisterUserResponse
  },
  'api/ToBackendResendUserEmail': {
    request: zToBackendResendUserEmailRequest,
    response: zToBackendResendUserEmailResponse
  },
  'api/ToBackendResetUserPassword': {
    request: zToBackendResetUserPasswordRequest,
    response: zToBackendResetUserPasswordResponse
  },
  'api/ToBackendSetUserName': {
    request: zToBackendSetUserNameRequest,
    response: zToBackendSetUserNameResponse
  },
  'api/ToBackendSetUserUi': {
    request: zToBackendSetUserUiRequest,
    response: zToBackendSetUserUiResponse
  },
  'api/ToBackendStartUserCodexAuth': {
    request: zToBackendStartUserCodexAuthRequest,
    response: zToBackendStartUserCodexAuthResponse
  },
  'api/ToBackendUpdateUserPassword': {
    request: zToBackendUpdateUserPasswordRequest,
    response: zToBackendUpdateUserPasswordResponse
  },
  'api/ToBackendCreateLlmModel': {
    request: zToBackendCreateLlmModelRequest,
    response: zToBackendCreateLlmModelResponse
  },
  'api/ToBackendDeleteLlmModel': {
    request: zToBackendDeleteLlmModelRequest,
    response: zToBackendDeleteLlmModelResponse
  },
  'api/ToBackendEditLlmModel': {
    request: zToBackendEditLlmModelRequest,
    response: zToBackendEditLlmModelResponse
  },
  'api/ToBackendGetLlmModelParts': {
    request: zToBackendGetLlmModelPartsRequest,
    response: zToBackendGetLlmModelPartsResponse
  },
  'api/ToBackendGetLlmModelsWithProvider': {
    request: zToBackendGetLlmModelsWithProviderRequest,
    response: zToBackendGetLlmModelsWithProviderResponse
  },
  'api/ToBackendCreateProvider': {
    request: zToBackendCreateProviderRequest,
    response: zToBackendCreateProviderResponse
  },
  'api/ToBackendDeleteProvider': {
    request: zToBackendDeleteProviderRequest,
    response: zToBackendDeleteProviderResponse
  },
  'api/ToBackendEditProvider': {
    request: zToBackendEditProviderRequest,
    response: zToBackendEditProviderResponse
  },
  'api/ToBackendGetProviders': {
    request: zToBackendGetProvidersRequest,
    response: zToBackendGetProvidersResponse
  },
  'api/ToBackendToggleProvider': {
    request: zToBackendToggleProviderRequest,
    response: zToBackendToggleProviderResponse
  }
};
