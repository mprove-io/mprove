export enum ToBackendRequestInfoNameEnum {
  //
  ToBackendRebuildStructSpecial = 'api/ToBackendRebuildStructSpecial',
  //
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
  ToBackendSetUserTimezone = 'api/ToBackendSetUserTimezone',
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
  //
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
  ToBackendRevertRepoToProduction = 'api/ToBackendRevertRepoToProduction',
  ToBackendMergeRepo = 'api/ToBackendMergeRepo',
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
  //
  ToBackendGetModelsList = 'api/ToBackendGetModelsList',
  ToBackendGetModel = 'api/ToBackendGetModel',
  //
  ToBackendGetViews = 'api/ToBackendGetViews',
  //
  ToBackendGetDashboards = 'api/ToBackendGetDashboards',
  ToBackendGetDashboard = 'api/ToBackendGetDashboard',
  ToBackendCreateTempDashboard = 'api/ToBackendCreateTempDashboard',
  ToBackendCreateDashboard = 'api/ToBackendCreateDashboard',
  ToBackendModifyDashboard = 'api/ToBackendModifyDashboard',
  ToBackendDeleteDashboard = 'api/ToBackendDeleteDashboard',
  //
  ToBackendGetVizs = 'api/ToBackendGetVizs',
  ToBackendCreateViz = 'api/ToBackendCreateViz',
  ToBackendModifyViz = 'api/ToBackendModifyViz',
  ToBackendDeleteViz = 'api/ToBackendDeleteViz',
  //
  ToBackendGetMconfig = 'api/ToBackendGetMconfig',
  ToBackendCreateTempMconfig = 'api/ToBackendCreateTempMconfig',
  ToBackendCreateTempMconfigAndQuery = 'api/ToBackendCreateTempMconfigAndQuery',
  //
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
