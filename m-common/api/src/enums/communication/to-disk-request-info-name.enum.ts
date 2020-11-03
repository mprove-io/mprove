export enum ToDiskRequestInfoNameEnum {
  ToDiskCreateOrganization = 'ToDiskCreateOrganization',
  ToDiskDeleteOrganization = 'ToDiskDeleteOrganization',
  ToDiskIsOrganizationExist = 'ToDiskIsOrganizationExist',

  ToDiskCreateProject = 'ToDiskCreateProject',
  ToDiskDeleteProject = 'ToDiskDeleteProject',
  ToDiskIsProjectExist = 'ToDiskIsProjectExist',

  ToDiskCommitRepo = 'ToDiskCommitRepo',
  ToDiskCreateDevRepo = 'ToDiskCreateDevRepo',
  ToDiskDeleteDevRepo = 'ToDiskDeleteDevRepo',
  ToDiskMergeRepo = 'ToDiskMergeRepo',
  ToDiskPullRepo = 'ToDiskPullRepo',
  ToDiskPushRepo = 'ToDiskPushRepo',
  ToDiskRevertRepoToLastCommit = 'ToDiskRevertRepoToLastCommit',
  ToDiskRevertRepoToProduction = 'ToDiskRevertRepoToProduction',

  ToDiskGetCatalogFiles = 'ToDiskGetCatalogFiles',
  ToDiskGetCatalogNodes = 'ToDiskGetCatalogNodes',
  ToDiskMoveCatalogNode = 'ToDiskMoveCatalogNode',
  ToDiskRenameCatalogNode = 'ToDiskRenameCatalogNode',

  ToDiskCreateBranch = 'ToDiskCreateBranch',
  ToDiskDeleteBranch = 'ToDiskDeleteBranch',
  ToDiskIsBranchExist = 'ToDiskIsBranchExist',

  ToDiskCreateFolder = 'ToDiskCreateFolder',
  ToDiskDeleteFolder = 'ToDiskDeleteFolder',

  ToDiskCreateFile = 'ToDiskCreateFile',
  ToDiskDeleteFile = 'ToDiskDeleteFile',
  ToDiskGetFile = 'ToDiskGetFile',
  ToDiskSaveFile = 'ToDiskSaveFile',

  ToDiskSeedProject = 'ToDiskSeedProject'
}
