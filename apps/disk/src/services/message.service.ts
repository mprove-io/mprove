import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { METHOD_RABBIT } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { ServerError } from '~common/models/server-error';
import { DiskConfig } from '~disk/config/disk-config';
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
import { RevertRepoToRemoteService } from '~disk/controllers/03-repos/revert-repo-to-remote/revert-repo-to-remote.service';
import { SyncRepoService } from '~disk/controllers/03-repos/sync-repo/sync-repo.service';
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
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';

@Injectable()
export class MessageService {
  constructor(
    private cs: ConfigService<DiskConfig>,

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
    private revertRepoToRemoteService: RevertRepoToRemoteService,
    private syncRepoService: SyncRepoService,

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

    private seedProjectService: SeedProjectService,
    private logger: Logger
  ) {}

  async processMessage(request: any) {
    let startTs = Date.now();
    try {
      let payload = await this.processSwitch(request);

      return makeOkResponseDisk({
        payload: payload,
        body: request,
        path: request.info.name,
        method: METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      let { resp, wrappedError } = makeErrorResponseDisk({
        e: e,
        body: request,
        path: request.info.name,
        method: METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });

      return resp;
    }
  }

  async processSwitch(request: any): Promise<any> {
    switch (request.info.name) {
      case ToDiskRequestInfoNameEnum.ToDiskCreateOrg:
        return await this.createOrgService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskDeleteOrg:
        return await this.deleteOrgService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskIsOrgExist:
        return await this.isOrgExistService.process(request);

      case ToDiskRequestInfoNameEnum.ToDiskCreateProject:
        return await this.createProjectService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskDeleteProject:
        return await this.deleteProjectService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskIsProjectExist:
        return await this.isProjectExistService.process(request);

      case ToDiskRequestInfoNameEnum.ToDiskCommitRepo:
        return await this.commitRepoService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo:
        return await this.createDevRepoService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo:
        return await this.deleteDevRepoService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskMergeRepo:
        return await this.mergeRepoService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskPullRepo:
        return await this.pullRepoService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskPushRepo:
        return await this.pushRepoService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit:
        return await this.revertRepoToLastCommitService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskRevertRepoToRemote:
        return await this.revertRepoToRemoteService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskSyncRepo:
        return await this.syncRepoService.process(request);

      case ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles:
        return await this.getCatalogFilesService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes:
        return await this.getCatalogNodesService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode:
        return await this.moveCatalogNodeService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode:
        return await this.renameCatalogNodeService.process(request);

      case ToDiskRequestInfoNameEnum.ToDiskCreateBranch:
        return await this.createBranchService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskDeleteBranch:
        return await this.deleteBranchService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskIsBranchExist:
        return await this.isBranchExistService.process(request);

      case ToDiskRequestInfoNameEnum.ToDiskCreateFolder:
        return await this.createFolderService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskDeleteFolder:
        return await this.deleteFolderService.process(request);

      case ToDiskRequestInfoNameEnum.ToDiskCreateFile:
        return await this.createFileService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskDeleteFile:
        return await this.deleteFileService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskGetFile:
        return await this.getFileService.process(request);
      case ToDiskRequestInfoNameEnum.ToDiskSaveFile:
        return await this.saveFileService.process(request);

      case ToDiskRequestInfoNameEnum.ToDiskSeedProject:
        return await this.seedProjectService.process(request);

      default:
        throw new ServerError({
          message: ErEnum.DISK_WRONG_REQUEST_INFO_NAME
        });
    }
  }
}
