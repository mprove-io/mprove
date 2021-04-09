export enum ToBackendRequestInfoNameEnum {
  //
  ToBackendRebuildStructSpecial = 'ToBackendRebuildStructSpecial',
  //
  ToBackendSeedRecords = 'ToBackendSeedRecords',
  ToBackendDeleteRecords = 'ToBackendDeleteRecords',
  //
  ToBackendConfirmUserEmail = 'ToBackendConfirmUserEmail',
  ToBackendGetUserProfile = 'ToBackendGetUserProfile',
  ToBackendLoginUser = 'ToBackendLoginUser',
  ToBackendLogoutUser = 'ToBackendLogoutUser',
  ToBackendRegisterUser = 'ToBackendRegisterUser',
  ToBackendResendUserEmail = 'ToBackendResendUserEmail',
  ToBackendSetUserName = 'ToBackendSetUserName',
  ToBackendSetUserTimezone = 'ToBackendSetUserTimezone',
  ToBackendResetUserPassword = 'ToBackendResetUserPassword',
  ToBackendUpdateUserPassword = 'ToBackendUpdateUserPassword',
  ToBackendDeleteUser = 'ToBackendDeleteUser',
  //
  ToBackendCreateOrg = 'ToBackendCreateOrg',
  ToBackendGetOrgsList = 'ToBackendGetOrgsList',
  ToBackendGetOrg = 'ToBackendGetOrg',
  ToBackendIsOrgExist = 'ToBackendIsOrgExist',
  ToBackendSetOrgInfo = 'ToBackendSetOrgInfo',
  ToBackendSetOrgOwner = 'ToBackendSetOrgOwner',
  ToBackendDeleteOrg = 'ToBackendDeleteOrg',
  //
  ToBackendCreateProject = 'ToBackendCreateProject',
  ToBackendIsProjectExist = 'ToBackendIsProjectExist',
  ToBackendGetProject = 'ToBackendGetProject',
  ToBackendSetProjectTimezone = 'ToBackendSetProjectTimezone',
  ToBackendSetProjectWeekStart = 'ToBackendSetProjectWeekStart',
  ToBackendSetProjectAllowTimezones = 'ToBackendSetProjectAllowTimezones',
  ToBackendGetProjectsList = 'ToBackendGetProjectsList',
  ToBackendDeleteProject = 'ToBackendDeleteProject',
  ToBackendSetProjectInfo = 'ToBackendSetProjectInfo',
  //
  ToBackendGetMembers = 'ToBackendGetMembers',
  ToBackendCreateMember = 'ToBackendCreateMember',
  ToBackendEditMember = 'ToBackendEditMember',
  ToBackendDeleteMember = 'ToBackendDeleteMember',
  //
  ToBackendGetOrgUsers = 'ToBackendGetOrgUsers',
  //
  ToBackendGetConnections = 'ToBackendGetConnections',
  ToBackendCreateConnection = 'ToBackendCreateConnection',
  ToBackendDeleteConnection = 'ToBackendDeleteConnection',
  //
  ToBackendEditConnection = 'ToBackendEditConnection',
  //
  ToBackendGetBranchesList = 'ToBackendGetBranchesList',
  ToBackendIsBranchExist = 'ToBackendIsBranchExist',
  ToBackendCreateBranch = 'ToBackendCreateBranch',
  ToBackendDeleteBranch = 'ToBackendDeleteBranch',
  //
  ToBackendGetRepo = 'ToBackendGetRepo',
  ToBackendCommitRepo = 'ToBackendCommitRepo',
  ToBackendPushRepo = 'ToBackendPushRepo',
  ToBackendPullRepo = 'ToBackendPullRepo',
  ToBackendRevertRepoToLastCommit = 'ToBackendRevertRepoToLastCommit',
  ToBackendRevertRepoToProduction = 'ToBackendRevertRepoToProduction',
  ToBackendMergeRepo = 'ToBackendMergeRepo',
  //
  ToBackendMoveCatalogNode = 'ToBackendMoveCatalogNode',
  ToBackendRenameCatalogNode = 'ToBackendRenameCatalogNode',
  //
  ToBackendCreateFolder = 'ToBackendCreateFolder',
  ToBackendDeleteFolder = 'ToBackendDeleteFolder',
  //
  ToBackendGetFile = 'ToBackendGetFile',
  ToBackendCreateFile = 'ToBackendCreateFile',
  ToBackendDeleteFile = 'ToBackendDeleteFile',
  ToBackendSaveFile = 'ToBackendSaveFile',
  //
  ToBackendGetModelsList = 'ToBackendGetModelsList',
  ToBackendGetModel = 'ToBackendGetModel',
  //
  ToBackendGetViews = 'ToBackendGetViews',
  //
  ToBackendGetDashboardsList = 'ToBackendGetDashboardsList',
  ToBackendGetDashboard = 'ToBackendGetDashboard',
  ToBackendCreateTempDashboard = 'ToBackendCreateTempDashboard',
  ToBackendCreateDashboard = 'ToBackendCreateDashboard',
  ToBackendModifyDashboard = 'ToBackendModifyDashboard',
  ToBackendDeleteDashboard = 'ToBackendDeleteDashboard',
  //
  ToBackendGetVizs = 'ToBackendGetVizs',
  ToBackendCreateViz = 'ToBackendCreateViz',
  ToBackendModifyViz = 'ToBackendModifyViz',
  ToBackendDeleteViz = 'ToBackendDeleteViz',
  //
  ToBackendGetMconfig = 'ToBackendGetMconfig',
  ToBackendCreateTempMconfig = 'ToBackendCreateTempMconfig',
  ToBackendCreateTempMconfigAndQuery = 'ToBackendCreateTempMconfigAndQuery',
  //
  ToBackendGetQuery = 'ToBackendGetQuery',
  ToBackendRunQueries = 'ToBackendRunQueries',
  ToBackendRunQueriesDry = 'ToBackendRunQueriesDry',
  ToBackendCancelQueries = 'ToBackendCancelQueries',
  //
  ToBackendGetNav = 'ToBackendGetNav',
  //
  ToBackendGetAvatarBig = 'ToBackendGetAvatarBig',
  ToBackendSetAvatar = 'ToBackendSetAvatar'
}
