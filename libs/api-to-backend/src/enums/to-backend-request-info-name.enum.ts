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
  ToBackendDeleteEnv = 'api/ToBackendDeleteEnv',
  //
  ToBackendGetEvs = 'api/ToBackendGetEvs',
  ToBackendCreateEv = 'api/ToBackendCreateEv',
  ToBackendDeleteEv = 'api/ToBackendDeleteEv',
  ToBackendEditEv = 'api/ToBackendEditEv',
  //
  ToBackendGetMembers = 'api/ToBackendGetMembers',
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
  ToBackendGetReport = 'api/ToBackendGetReport',
  ToBackendCreateDraftReport = 'api/ToBackendCreateDraftReport',
  ToBackendEditDraftReport = 'api/ToBackendEditDraftReport',
  ToBackendDeleteDraftReports = 'api/ToBackendDeleteDraftReports',
  ToBackendSaveCreateReport = 'api/ToBackendSaveCreateReport',
  ToBackendSaveModifyReport = 'api/ToBackendSaveModifyReport',
  ToBackendDeleteReport = 'api/ToBackendDeleteReport',
  //
  ToBackendGetMetrics = 'api/ToBackendGetMetrics',
  ToBackendGetSuggestFields = 'api/ToBackendGetSuggestFields',
  //
  ToBackendGetModels = 'api/ToBackendGetModels',
  ToBackendGetModel = 'api/ToBackendGetModel',
  //
  ToBackendGetViews = 'api/ToBackendGetViews',
  //
  ToBackendGetDashboards = 'api/ToBackendGetDashboards',
  ToBackendGetDashboard = 'api/ToBackendGetDashboard',
  ToBackendCreateDraftDashboard = 'api/ToBackendCreateDraftDashboard',
  ToBackendCreateDashboard = 'api/ToBackendCreateDashboard',
  ToBackendModifyDashboard = 'api/ToBackendModifyDashboard',
  ToBackendDeleteDashboard = 'api/ToBackendDeleteDashboard',
  ToBackendDeleteDraftDashboards = 'api/ToBackendDeleteDraftDashboards',
  //
  ToBackendGetCharts = 'api/ToBackendGetCharts',
  ToBackendGetChart = 'api/ToBackendGetChart',
  ToBackendCreateChart = 'api/ToBackendCreateChart',
  ToBackendModifyChart = 'api/ToBackendModifyChart',
  ToBackendDeleteChart = 'api/ToBackendDeleteChart',
  //
  ToBackendGetMconfig = 'api/ToBackendGetMconfig',
  ToBackendCreateTempMconfig = 'api/ToBackendCreateTempMconfig',
  ToBackendCreateTempMconfigAndQuery = 'api/ToBackendCreateTempMconfigAndQuery',
  ToBackendDuplicateMconfigAndQuery = 'api/ToBackendDuplicateMconfigAndQuery',
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
