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
  ToBackendSetUserName = 'ToBackendSetUserName',
  ToBackendSetUserTimezone = 'ToBackendSetUserTimezone',
  ToBackendResetUserPassword = 'ToBackendResetUserPassword',
  ToBackendUpdateUserPassword = 'ToBackendUpdateUserPassword',
  //
  ToBackendCreateOrg = 'ToBackendCreateOrg',
  ToBackendGetOrgsList = 'ToBackendGetOrgsList',
  ToBackendGetOrg = 'ToBackendGetOrg',
  ToBackendIsOrgExist = 'ToBackendIsOrgExist',
  ToBackendSetOrgInfo = 'ToBackendSetOrgInfo',
  ToBackendSetOrgOwner = 'ToBackendSetOrgOwner',
  //
  ToBackendCreateProject = 'ToBackendCreateProject',
  ToBackendIsProjectExist = 'ToBackendIsProjectExist',
  ToBackendGetProject = 'ToBackendGetProject',
  ToBackendSetProjectTimezone = 'ToBackendSetProjectTimezone',
  ToBackendSetProjectWeekStart = 'ToBackendSetProjectWeekStart',
  ToBackendSetProjectAllowTimezones = 'ToBackendSetProjectAllowTimezones',
  ToBackendGetProjectsList = 'ToBackendGetProjectsList',
  //
  ToBackendGetMembers = 'ToBackendGetMembers',
  ToBackendCreateMember = 'ToBackendCreateMember',
  ToBackendEditMember = 'ToBackendEditMember',
  //
  ToBackendGetOrgUsers = 'ToBackendGetOrgUsers',
  //
  ToBackendGetConnections = 'ToBackendGetConnections',
  ToBackendCreateConnection = 'ToBackendCreateConnection',
  //
  ToBackendEditConnection = 'ToBackendEditConnection',
  //
  ToBackendGetBranchesList = 'ToBackendGetBranchesList',
  ToBackendIsBranchExist = 'ToBackendIsBranchExist',
  ToBackendCreateBranch = 'ToBackendCreateBranch',
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
  ToBackendGetNav = 'ToBackendGetNav'
}
