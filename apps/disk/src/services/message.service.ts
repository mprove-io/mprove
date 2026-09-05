import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { match } from 'ts-pattern';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { MyResponse } from '#common/zod/to/my-response';
import type {
  ToDiskOperationRequest,
  ToDiskOperationResponse,
  ToDiskResponseForRequest
} from '#common/zod/to-disk/to-disk-operation-contract';
import { DiskConfig } from '#disk/config/disk-config';
import { CreateOrgService } from '#disk/controllers/01-orgs/create-org/create-org.service';
import { DeleteOrgService } from '#disk/controllers/01-orgs/delete-org/delete-org.service';
import { IsOrgExistService } from '#disk/controllers/01-orgs/is-org-exist/is-org-exist.service';
import { CreateProjectService } from '#disk/controllers/02-projects/create-project/create-project.service';
import { DeleteProjectService } from '#disk/controllers/02-projects/delete-project/delete-project.service';
import { IsProjectExistService } from '#disk/controllers/02-projects/is-project-exist/is-project-exist.service';
import { CommitRepoService } from '#disk/controllers/03-repos/commit-repo/commit-repo.service';
import { CreateDevRepoService } from '#disk/controllers/03-repos/create-dev-repo/create-dev-repo.service';
import { DeleteDevRepoService } from '#disk/controllers/03-repos/delete-dev-repo/delete-dev-repo.service';
import { MergeRepoService } from '#disk/controllers/03-repos/merge-repo/merge-repo.service';
import { PullRepoService } from '#disk/controllers/03-repos/pull-repo/pull-repo.service';
import { PushRepoService } from '#disk/controllers/03-repos/push-repo/push-repo.service';
import { RevertRepoToLastCommitService } from '#disk/controllers/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit.service';
import { RevertRepoToRemoteService } from '#disk/controllers/03-repos/revert-repo-to-remote/revert-repo-to-remote.service';
import { SyncRepoService } from '#disk/controllers/03-repos/sync-repo/sync-repo.service';
import { GetCatalogFilesService } from '#disk/controllers/04-catalogs/get-catalog-files/get-catalog-files.service';
import { GetCatalogNodesService } from '#disk/controllers/04-catalogs/get-catalog-nodes/get-catalog-nodes.service';
import { MoveCatalogNodeService } from '#disk/controllers/04-catalogs/move-catalog-node/move-catalog-node.service';
import { RenameCatalogNodeService } from '#disk/controllers/04-catalogs/rename-catalog-node/rename-catalog-node.service';
import { CreateBranchService } from '#disk/controllers/05-branches/create-branch/create-branch.service';
import { DeleteBranchService } from '#disk/controllers/05-branches/delete-branch/delete-branch.service';
import { IsBranchExistService } from '#disk/controllers/05-branches/is-branch-exist/is-branch-exist.service';
import { CreateFolderService } from '#disk/controllers/06-folders/create-folder/create-folder.service';
import { DeleteFolderService } from '#disk/controllers/06-folders/delete-folder/delete-folder.service';
import { CreateFileService } from '#disk/controllers/07-files/create-file/create-file.service';
import { DeleteFileService } from '#disk/controllers/07-files/delete-file/delete-file.service';
import { GetFileService } from '#disk/controllers/07-files/get-file/get-file.service';
import { SaveFileService } from '#disk/controllers/07-files/save-file/save-file.service';
import { SeedProjectService } from '#disk/controllers/08-seed/seed-project/seed-project.service';
import { CloneTestRepoService } from '#disk/controllers/09-test/clone-test-repo/clone-test-repo.service';
import { makeErrorResponseDisk } from '#disk/functions/make-error-response-disk';
import {
  type DiskResponse,
  makeOkResponseDisk
} from '#disk/functions/make-ok-response-disk';

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
    private cloneTestRepoService: CloneTestRepoService,
    private logger: Logger
  ) {}

  async processMessage<TRequest extends ToDiskOperationRequest>(
    item: TRequest
  ): Promise<ToDiskResponseForRequest<TRequest>> {
    let body: TRequest = item;

    let startTs: number = Date.now();

    let response: MyResponse;

    try {
      let payload: ToDiskOperationResponse['payload'] =
        await this.processSwitch(body);

      let okResponse: DiskResponse<
        ToDiskOperationResponse['payload'],
        TRequest['info']['name'],
        typeof METHOD_RPC
      > = makeOkResponseDisk({
        payload: payload,
        body: body,
        path: body.info.name,
        method: METHOD_RPC,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });

      response = okResponse;
    } catch (e) {
      let { resp, wrappedError } = makeErrorResponseDisk({
        e: e,
        body: body,
        path: body.info.name,
        method: METHOD_RPC,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });

      response = resp;
    }

    // Existing operation schemas describe success payloads, but runtime errors
    // intentionally use {}. This boundary also restores the generic correlation.
    return response as ToDiskResponseForRequest<TRequest>;
  }

  async processSwitch(
    item: ToDiskOperationRequest
  ): Promise<ToDiskOperationResponse['payload']> {
    let request: ToDiskOperationRequest = item;

    let payload: ToDiskOperationResponse['payload'] = await match(request)
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskCreateOrg } },
        request => this.createOrgService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskDeleteOrg } },
        request => this.deleteOrgService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskIsOrgExist } },
        request => this.isOrgExistService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskCreateProject } },
        request => this.createProjectService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskDeleteProject } },
        request => this.deleteProjectService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskIsProjectExist } },
        request => this.isProjectExistService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskCommitRepo } },
        request => this.commitRepoService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo } },
        request => this.createDevRepoService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo } },
        request => this.deleteDevRepoService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskMergeRepo } },
        request => this.mergeRepoService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskPullRepo } },
        request => this.pullRepoService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskPushRepo } },
        request => this.pushRepoService.process(request)
      )
      .with(
        {
          info: {
            name: ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit
          }
        },
        request => this.revertRepoToLastCommitService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskRevertRepoToRemote } },
        request => this.revertRepoToRemoteService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskSyncRepo } },
        request => this.syncRepoService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles } },
        request => this.getCatalogFilesService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes } },
        request => this.getCatalogNodesService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode } },
        request => this.moveCatalogNodeService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode } },
        request => this.renameCatalogNodeService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskCreateBranch } },
        request => this.createBranchService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskDeleteBranch } },
        request => this.deleteBranchService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskIsBranchExist } },
        request => this.isBranchExistService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskCreateFolder } },
        request => this.createFolderService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskDeleteFolder } },
        request => this.deleteFolderService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskCreateFile } },
        request => this.createFileService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskDeleteFile } },
        request => this.deleteFileService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskGetFile } },
        request => this.getFileService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskSaveFile } },
        request => this.saveFileService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskSeedProject } },
        request => this.seedProjectService.process(request)
      )
      .with(
        { info: { name: ToDiskRequestInfoNameEnum.ToDiskCloneTestRepo } },
        request => this.cloneTestRepoService.process(request)
      )
      .exhaustive();

    return payload;
  }
}
