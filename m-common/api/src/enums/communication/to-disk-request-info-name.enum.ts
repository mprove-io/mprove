export enum ToDiskRequestInfoNameEnum {
  ToDiskCreateOrganization = <any>'ToDiskCreateOrganization',
  ToDiskDeleteOrganization = <any>'ToDiskDeleteOrganization',
  ToDiskIsOrganizationExist = <any>'ToDiskIsOrganizationExist',

  ToDiskCreateProject = <any>'ToDiskCreateProject',
  ToDiskDeleteProject = <any>'ToDiskDeleteProject',
  ToDiskIsProjectExist = <any>'ToDiskIsProjectExist',

  ToDiskCommitRepo = <any>'ToDiskCommitRepo',
  ToDiskCreateDevRepo = <any>'ToDiskCreateDevRepo',
  ToDiskDeleteDevRepo = <any>'ToDiskDeleteDevRepo',
  ToDiskMergeRepo = <any>'ToDiskMergeRepo',
  ToDiskPullRepo = <any>'ToDiskPullRepo',
  ToDiskPushRepo = <any>'ToDiskPushRepo',
  ToDiskRevertRepoToLastCommit = <any>'ToDiskRevertRepoToLastCommit',
  ToDiskRevertRepoToProduction = <any>'ToDiskRevertRepoToProduction',

  ToDiskGetCatalogFiles = <any>'ToDiskGetCatalogFiles',
  ToDiskGetCatalogNodes = <any>'ToDiskGetCatalogNodes',
  ToDiskMoveCatalogNode = <any>'ToDiskMoveCatalogNode',
  ToDiskRenameCatalogNode = <any>'ToDiskRenameCatalogNode',

  ToDiskCreateBranch = <any>'ToDiskCreateBranch',
  ToDiskDeleteBranch = <any>'ToDiskDeleteBranch',
  ToDiskIsBranchExist = <any>'ToDiskIsBranchExist',

  ToDiskCreateFolder = <any>'ToDiskCreateFolder',
  ToDiskDeleteFolder = <any>'ToDiskDeleteFolder',

  ToDiskCreateFile = <any>'ToDiskCreateFile',
  ToDiskDeleteFile = <any>'ToDiskDeleteFile',
  ToDiskGetFile = <any>'ToDiskGetFile',
  ToDiskSaveFile = <any>'ToDiskSaveFile'
}
