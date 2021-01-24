import { Injectable } from '@nestjs/common';
import { api } from '../barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../barrels/interfaces';

import { CreateOrganizationService } from './01-organizations/create-organization.service';
import { DeleteOrganizationService } from './01-organizations/delete-organization.service';
import { IsOrganizationExistService } from './01-organizations/is-organization-exist.service';
import { CreateProjectService } from './02-projects/create-project.service';
import { DeleteProjectService } from './02-projects/delete-project.service';
import { IsProjectExistService } from './02-projects/is-project-exist.service';
import { CommitRepoService } from './03-repos/commit-repo.service';
import { CreateDevRepoService } from './03-repos/create-dev-repo.service';
import { DeleteDevRepoService } from './03-repos/delete-dev-repo.service';
import { MergeRepoService } from './03-repos/merge-repo.service';
import { PullRepoService } from './03-repos/pull-repo.service';
import { PushRepoService } from './03-repos/push-repo.service';
import { RevertRepoToLastCommitService } from './03-repos/revert-repo-to-last-commit.service';
import { RevertRepoToProductionService } from './03-repos/revert-repo-to-production.service';
import { GetCatalogFilesService } from './04-catalogs/get-catalog-files.service';
import { GetCatalogNodesService } from './04-catalogs/get-catalog-nodes.service';
import { MoveCatalogNodeService } from './04-catalogs/move-catalog-node.service';
import { RenameCatalogNodeService } from './04-catalogs/rename-catalog-node.service';
import { CreateBranchService } from './05-branches/create-branch.service';
import { DeleteBranchService } from './05-branches/delete-branch.service';
import { IsBranchExistService } from './05-branches/is-branch-exist.service';
import { CreateFolderService } from './06-folders/create-folder.service';
import { DeleteFolderService } from './06-folders/delete-folder.service';
import { CreateFileService } from './07-files/create-file.service';
import { DeleteFileService } from './07-files/delete-file.service';
import { GetFileService } from './07-files/get-file.service';
import { SaveFileService } from './07-files/save-file.service';
import { SeedProjectService } from './08-seed/seed-project.service';

@Injectable()
export class MessageService {
  constructor(
    private cs: ConfigService<interfaces.Config>,

    private createOrganizationService: CreateOrganizationService,
    private deleteOrganizationService: DeleteOrganizationService,
    private isOrganizationExistService: IsOrganizationExistService,

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

      return api.makeOkResponse({ payload, cs: this.cs, req: request });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }

  async processSwitch(request: any): Promise<any> {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    switch (request.info.name) {
      case api.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization:
        return await this.createOrganizationService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization:
        return await this.deleteOrganizationService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist:
        return await this.isOrganizationExistService.process(request);

      case api.ToDiskRequestInfoNameEnum.ToDiskCreateProject:
        return await this.createProjectService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteProject:
        return await this.deleteProjectService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist:
        return await this.isProjectExistService.process(request);

      case api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo:
        return await this.commitRepoService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo:
        return await this.createDevRepoService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo:
        return await this.deleteDevRepoService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskMergeRepo:
        return await this.mergeRepoService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskPullRepo:
        return await this.pullRepoService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskPushRepo:
        return await this.pushRepoService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit:
        return await this.revertRepoToLastCommitService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToProduction:
        return await this.revertRepoToProductionService.process(request);

      case api.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles:
        return await this.getCatalogFilesService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes:
        return await this.getCatalogNodesService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode:
        return await this.moveCatalogNodeService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode:
        return await this.renameCatalogNodeService.process(request);

      case api.ToDiskRequestInfoNameEnum.ToDiskCreateBranch:
        return await this.createBranchService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteBranch:
        return await this.deleteBranchService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist:
        return await this.isBranchExistService.process(request);

      case api.ToDiskRequestInfoNameEnum.ToDiskCreateFolder:
        return await this.createFolderService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteFolder:
        return await this.deleteFolderService.process(request);

      case api.ToDiskRequestInfoNameEnum.ToDiskCreateFile:
        return await this.createFileService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteFile:
        return await this.deleteFileService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskGetFile:
        return await this.getFileService.process(request);
      case api.ToDiskRequestInfoNameEnum.ToDiskSaveFile:
        return await this.saveFileService.process(request);

      case api.ToDiskRequestInfoNameEnum.ToDiskSeedProject:
        return await this.seedProjectService.process(request);

      default:
        throw new api.ServerError({
          message: api.ErEnum.M_DISK_WRONG_REQUEST_INFO_NAME
        });
    }
  }
}
