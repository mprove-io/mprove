export enum ToBackendRequestInfoNameEnum {
  //
  ToBackendSpecialRebuildStructs = 'api/ToBackendSpecialRebuildStructs',
  //
  ToBackendGetRebuildStruct = 'api/ToBackendGetRebuildStruct',
  ToBackendSeedRecords = 'api/ToBackendSeedRecords',
  ToBackendDeleteRecords = 'api/ToBackendDeleteRecords',
  //
  ToBackendCompleteUserRegistration = 'api/ToBackendCompleteUserRegistration',
  ToBackendConfirmUserEmail = 'api/ToBackendConfirmUserEmail',
  ToBackendGetUserProfile = 'api/ToBackendGetUserProfile',
  ToBackendLoginUser = 'api/ToBackendLoginUser',
  ToBackendLogoutUser = 'api/ToBackendLogoutUser',
  ToBackendRegisterUser = 'api/ToBackendRegisterUser',
  ToBackendResendUserEmail = 'api/ToBackendResendUserEmail',
  ToBackendSetUserName = 'api/ToBackendSetUserName',
  ToBackendSetUserUi = 'api/ToBackendSetUserUi',
  ToBackendResetUserPassword = 'api/ToBackendResetUserPassword',
  ToBackendUpdateUserPassword = 'api/ToBackendUpdateUserPassword',
  ToBackendDeleteUser = 'api/ToBackendDeleteUser',
  //
  ToBackendCreateOrg = 'api/ToBackendCreateOrg',
  ToBackendGetOrgsList = 'api/ToBackendGetOrgsList',
  ToBackendGetOrg = 'api/ToBackendGetOrg',
  ToBackendIsOrgExist = 'api/ToBackendIsOrgExist',
  ToBackendSetOrgInfo = 'api/ToBackendSetOrgInfo',
  ToBackendSetOrgOwner = 'api/ToBackendSetOrgOwner',
  ToBackendDeleteOrg = 'api/ToBackendDeleteOrg',
  //
  ToBackendGenerateProjectRemoteKey = 'api/ToBackendGenerateProjectRemoteKey',
  ToBackendCreateProject = 'api/ToBackendCreateProject',
  ToBackendIsProjectExist = 'api/ToBackendIsProjectExist',
  ToBackendGetProject = 'api/ToBackendGetProject',
  ToBackendSetProjectTimezone = 'api/ToBackendSetProjectTimezone',
  ToBackendSetProjectWeekStart = 'api/ToBackendSetProjectWeekStart',
  ToBackendSetProjectAllowTimezones = 'api/ToBackendSetProjectAllowTimezones',
  ToBackendGetProjectsList = 'api/ToBackendGetProjectsList',
  ToBackendDeleteProject = 'api/ToBackendDeleteProject',
  ToBackendSetProjectInfo = 'api/ToBackendSetProjectInfo',
  //
  ToBackendGetEnvsList = 'api/ToBackendGetEnvsList',
  ToBackendGetEnvs = 'api/ToBackendGetEnvs',
  ToBackendCreateEnv = 'api/ToBackendCreateEnv',
  ToBackendCreateEnvUser = 'api/ToBackendCreateEnvUser',
  ToBackendCreateEnvVar = 'api/ToBackendCreateEnvVar',
  ToBackendDeleteEnv = 'api/ToBackendDeleteEnv',
  ToBackendDeleteEnvUser = 'api/ToBackendDeleteEnvUser',
  ToBackendDeleteEnvVar = 'api/ToBackendDeleteEnvVar',
  ToBackendEditEnvVar = 'api/ToBackendEditEnvVar',
  ToBackendEditEnvFallbacks = 'api/ToBackendEditEnvFallbacks',
  //
  ToBackendGetMembers = 'api/ToBackendGetMembers',
  ToBackendGetMembersList = 'api/ToBackendGetMembersList',
  ToBackendCreateMember = 'api/ToBackendCreateMember',
  ToBackendEditMember = 'api/ToBackendEditMember',
  ToBackendDeleteMember = 'api/ToBackendDeleteMember',
  //
  ToBackendGetOrgUsers = 'api/ToBackendGetOrgUsers',
  //
  ToBackendGetConnections = 'api/ToBackendGetConnections',
  ToBackendCreateConnection = 'api/ToBackendCreateConnection',
  ToBackendDeleteConnection = 'api/ToBackendDeleteConnection',
  ToBackendEditConnection = 'api/ToBackendEditConnection',
  //
  ToBackendGetBranchesList = 'api/ToBackendGetBranchesList',
  ToBackendIsBranchExist = 'api/ToBackendIsBranchExist',
  ToBackendCreateBranch = 'api/ToBackendCreateBranch',
  ToBackendDeleteBranch = 'api/ToBackendDeleteBranch',
  //
  ToBackendGetRepo = 'api/ToBackendGetRepo',
  ToBackendCommitRepo = 'api/ToBackendCommitRepo',
  ToBackendPushRepo = 'api/ToBackendPushRepo',
  ToBackendPullRepo = 'api/ToBackendPullRepo',
  ToBackendRevertRepoToLastCommit = 'api/ToBackendRevertRepoToLastCommit',
  ToBackendRevertRepoToRemote = 'api/ToBackendRevertRepoToRemote',
  ToBackendMergeRepo = 'api/ToBackendMergeRepo',
  ToBackendSyncRepo = 'api/ToBackendSyncRepo',
  //
  ToBackendGetStruct = 'api/ToBackendGetStruct',
  //
  ToBackendMoveCatalogNode = 'api/ToBackendMoveCatalogNode',
  ToBackendRenameCatalogNode = 'api/ToBackendRenameCatalogNode',
  //
  ToBackendCreateFolder = 'api/ToBackendCreateFolder',
  ToBackendDeleteFolder = 'api/ToBackendDeleteFolder',
  //
  ToBackendGetFile = 'api/ToBackendGetFile',
  ToBackendCreateFile = 'api/ToBackendCreateFile',
  ToBackendDeleteFile = 'api/ToBackendDeleteFile',
  ToBackendSaveFile = 'api/ToBackendSaveFile',
  ToBackendValidateFiles = 'api/ToBackendValidateFiles',
  //
  ToBackendGetSuggestFields = 'api/ToBackendGetSuggestFields',
  //
  ToBackendGetModels = 'api/ToBackendGetModels',
  ToBackendGetModel = 'api/ToBackendGetModel',
  //
  ToBackendCreateDraftChart = 'api/ToBackendCreateDraftChart',
  ToBackendDeleteChart = 'api/ToBackendDeleteChart',
  ToBackendDeleteDraftCharts = 'api/ToBackendDeleteDraftCharts',
  ToBackendEditDraftChart = 'api/ToBackendEditDraftChart',
  ToBackendGetChart = 'api/ToBackendGetChart',
  ToBackendGetCharts = 'api/ToBackendGetCharts',
  ToBackendSaveCreateChart = 'api/ToBackendSaveCreateChart',
  ToBackendSaveModifyChart = 'api/ToBackendSaveModifyChart',
  //
  ToBackendCreateDraftDashboard = 'api/ToBackendCreateDraftDashboard',
  ToBackendDeleteDashboard = 'api/ToBackendDeleteDashboard',
  ToBackendDeleteDraftDashboards = 'api/ToBackendDeleteDraftDashboards',
  ToBackendEditDraftDashboard = 'api/ToBackendEditDraftDashboard',
  ToBackendGetDashboard = 'api/ToBackendGetDashboard',
  ToBackendGetDashboards = 'api/ToBackendGetDashboards',
  ToBackendSaveCreateDashboard = 'api/ToBackendSaveCreateDashboard',
  ToBackendSaveModifyDashboard = 'api/ToBackendSaveModifyDashboard',
  //
  ToBackendCreateDraftReport = 'api/ToBackendCreateDraftReport',
  ToBackendDeleteDraftReports = 'api/ToBackendDeleteDraftReports',
  ToBackendDeleteReport = 'api/ToBackendDeleteReport',
  ToBackendEditDraftReport = 'api/ToBackendEditDraftReport',
  ToBackendGetReport = 'api/ToBackendGetReport',
  ToBackendGetReports = 'api/ToBackendGetReports',
  ToBackendSaveCreateReport = 'api/ToBackendSaveCreateReport',
  ToBackendSaveModifyReport = 'api/ToBackendSaveModifyReport',
  //
  ToBackendDuplicateMconfigAndQuery = 'api/ToBackendDuplicateMconfigAndQuery',
  ToBackendGroupMetricByDimension = 'api/ToBackendGroupMetricByDimension',
  ToBackendCreateTempMconfigAndQuery = 'api/ToBackendCreateTempMconfigAndQuery',
  //
  ToBackendGetQueries = 'api/ToBackendGetQueries',
  ToBackendGetQuery = 'api/ToBackendGetQuery',
  ToBackendRunQueries = 'api/ToBackendRunQueries',
  ToBackendRunQueriesDry = 'api/ToBackendRunQueriesDry',
  ToBackendCancelQueries = 'api/ToBackendCancelQueries',
  //
  ToBackendGetNav = 'api/ToBackendGetNav',
  //
  ToBackendGetAvatarBig = 'api/ToBackendGetAvatarBig',
  ToBackendSetAvatar = 'api/ToBackendSetAvatar'
}
