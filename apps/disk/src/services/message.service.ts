import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { CreateOrgService } from '~disk/controllers/01-orgs/create-org/create-org.service';
import { DeleteOrgService } from '~disk/controllers/01-orgs/delete-org/delete-org.service';
import { IsOrgExistService } from '~disk/controllers/01-orgs/is-org-exist/is-org-exist.service';
import { CreateProjectService } from '~disk/controllers/02-projects/create-project/create-project.service';
import { DeleteProjectService } from '~disk/controllers/02-projects/delete-project/delete-project.service';
import { IsProjectExistService } from '~disk/controllers/02-projects/is-project-exist/is-project-exist.service';
import { CommitRepoService } from '~disk/controllers/03-repos/commit-repo/commit-repo.service';
import { CreateDevRepoService } from '~disk/controllers/03-repos/create-dev-repo/create-dev-repo.service';
import { DeleteDevRepoService } from '~disk/controllers/03-repos/delete-dev-repo/delete-dev-repo.service';
import { MergeRepoService } from '~disk/controllers/03-repos/merge-repo/merge-repo.service';
import { PullRepoService } from '~disk/controllers/03-repos/pull-repo/pull-repo.service';
import { PushRepoService } from '~disk/controllers/03-repos/push-repo/push-repo.service';
import { RevertRepoToLastCommitService } from '~disk/controllers/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit.service';
import { RevertRepoToProductionService } from '~disk/controllers/03-repos/revert-repo-to-production/revert-repo-to-production.service';
import { GetCatalogFilesService } from '~disk/controllers/04-catalogs/get-catalog-files/get-catalog-files.service';
import { GetCatalogNodesService } from '~disk/controllers/04-catalogs/get-catalog-nodes/get-catalog-nodes.service';
import { MoveCatalogNodeService } from '~disk/controllers/04-catalogs/move-catalog-node/move-catalog-node.service';
import { RenameCatalogNodeService } from '~disk/controllers/04-catalogs/rename-catalog-node/rename-catalog-node.service';
import { CreateBranchService } from '~disk/controllers/05-branches/create-branch/create-branch.service';
import { DeleteBranchService } from '~disk/controllers/05-branches/delete-branch/delete-branch.service';
import { IsBranchExistService } from '~disk/controllers/05-branches/is-branch-exist/is-branch-exist.service';
import { CreateFolderService } from '~disk/controllers/06-folders/create-folder/create-folder.service';
import { DeleteFolderService } from '~disk/controllers/06-folders/delete-folder/delete-folder.service';
import { CreateFileService } from '~disk/controllers/07-files/create-file/create-file.service';
import { DeleteFileService } from '~disk/controllers/07-files/delete-file/delete-file.service';
import { GetFileService } from '~disk/controllers/07-files/get-file/get-file.service';
import { SaveFileService } from '~disk/controllers/07-files/save-file/save-file.service';
import { SeedProjectService } from '~disk/controllers/08-seed/seed-project/seed-project.service';

@Injectable()
export class MessageService {
  constructor(
    private cs: ConfigService<interfaces.Config>,

    private createOrgService: CreateOrgService,
    private deleteOrgService: DeleteOrgService,
    private isOrgExistService: IsOrgExistService,

    private createProjectService: CreateProjectService,
    private deleteProjectService: DeleteProjectService,
    private isProjectExistService: IsProjectExistService,

    private commitRepoService: CommitRepoService,
    private createDevRepoService: CreateDevRepoService,
    private deleteDevRepoService: DeleteDevRepoService,
    private mergeRepoService: MergeRepoService,
    private pullRepoService: PullRepoService,
    private pushRepoService: PushRepoService,
    private revertRepoToLastCommitService: RevertRepoToLastCommitService,
    private revertRepoToProductionService: RevertRepoToProductionService,

    private getCatalogFilesService: GetCatalogFilesService,
    private getCatalogNodesService: GetCatalogNodesService,
    private moveCatalogNodeService: MoveCatalogNodeService,
    private renameCatalogNodeService: RenameCatalogNodeService,

    private createBranchService: CreateBranchService,
    private deleteBranchService: DeleteBranchService,
    private isBranchExistService: IsBranchExistService,

    private createFolderService: CreateFolderService,
    private deleteFolderService: DeleteFolderService,

    private createFileService: CreateFileService,
    private deleteFileService: DeleteFileService,
    private getFileService: GetFileService,
    private saveFileService: SaveFileService,

    private seedProjectService: SeedProjectService
  ) {}

  async processMessage(request: any) {
    try {
      let payload = await this.processSwitch(request);

      return common.makeOkResponse({ payload, cs: this.cs, body: request });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, body: request });
    }
  }

  async processSwitch(request: any): Promise<any> {
    switch (request.info.name) {
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg:
        return await this.createOrgService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrg:
        return await this.deleteOrgService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsOrgExist:
        return await this.isOrgExistService.process(request);

      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateProject:
        return await this.createProjectService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteProject:
        return await this.deleteProjectService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist:
        return await this.isProjectExistService.process(request);

      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCommitRepo:
        return await this.commitRepoService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo:
        return await this.createDevRepoService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo:
        return await this.deleteDevRepoService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskMergeRepo:
        return await this.mergeRepoService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskPullRepo:
        return await this.pullRepoService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskPushRepo:
        return await this.pushRepoService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit:
        return await this.revertRepoToLastCommitService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToProduction:
        return await this.revertRepoToProductionService.process(request);

      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles:
        return await this.getCatalogFilesService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes:
        return await this.getCatalogNodesService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode:
        return await this.moveCatalogNodeService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode:
        return await this.renameCatalogNodeService.process(request);

      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateBranch:
        return await this.createBranchService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteBranch:
        return await this.deleteBranchService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist:
        return await this.isBranchExistService.process(request);

      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFolder:
        return await this.createFolderService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteFolder:
        return await this.deleteFolderService.process(request);

      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFile:
        return await this.createFileService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteFile:
        return await this.deleteFileService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetFile:
        return await this.getFileService.process(request);
      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile:
        return await this.saveFileService.process(request);

      case apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSeedProject:
        return await this.seedProjectService.process(request);

      default:
        throw new common.ServerError({
          message: apiToDisk.ErEnum.DISK_WRONG_REQUEST_INFO_NAME
        });
    }
  }
}
