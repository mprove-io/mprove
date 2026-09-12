import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import {
  getToDiskOperationNameForValue,
  getToDiskRequestSchema,
  isToDiskOperationValue,
  type ToDiskOperationName,
  type ToDiskOperationResponse,
  type ToDiskOperationValue,
  type ToDiskRequest,
  type ToDiskResponseForRequest,
  type ToDiskRpcResponse,
  type ToDiskWireResponseFor
} from '#common/zod/to-disk/to-disk-operation-contract';
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
import { makeInvalidRequestResponse } from '#disk/functions/make-invalid-request-response';
import { makeUnrouteableResponse } from '#disk/functions/make-unrouteable-response';
import { processValidatedRequest } from '#disk/functions/process-validated-request';

@Injectable()
export class MessageService {
  constructor(
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

  async processRequest<TRequest extends ToDiskRequest>(item: {
    request: TRequest;
  }): Promise<ToDiskResponseForRequest<TRequest>> {
    let { request } = item;

    let response: ToDiskRpcResponse = await this.handleMessage({
      message: request
    });

    let typedResponse: ToDiskResponseForRequest<TRequest> =
      response as ToDiskResponseForRequest<TRequest>;

    return typedResponse;
  }

  async handleMessage(item: { message: unknown }): Promise<ToDiskRpcResponse> {
    let { message } = item;

    let startTs: number = Date.now();

    let operationValue: unknown =
      typeof message === 'object' && message !== null && 'operation' in message
        ? message.operation
        : undefined;

    let operationItem: { operation: unknown } = {
      operation: operationValue
    };

    let isOperation: boolean = isToDiskOperationValue(operationItem);

    if (isOperation === false) {
      let response: ToDiskRpcResponse = makeUnrouteableResponse({
        message: message
      });

      return response;
    }

    // The registry-backed predicate above validated the discriminator.
    let operation: ToDiskOperationValue =
      operationItem.operation as ToDiskOperationValue;

    let name: ToDiskOperationName = getToDiskOperationNameForValue({
      operation: operation
    });

    let requestResult: z.ZodSafeParseResult<ToDiskRequest> =
      getToDiskRequestSchema({ name: name }).safeParse(message);

    if (requestResult.success === false) {
      let response: ToDiskOperationResponse = makeInvalidRequestResponse({
        name: name,
        message: message,
        error: requestResult.error,
        startTs: startTs,
        method: METHOD_RPC
      });

      return response;
    }

    let response: ToDiskOperationResponse = await this.dispatch({
      request: requestResult.data
    });

    return response;
  }

  private async dispatch(item: {
    request: ToDiskRequest;
  }): Promise<ToDiskOperationResponse> {
    let { request } = item;

    switch (request.operation) {
      case 'createOrg': {
        let response: ToDiskWireResponseFor<'ToDiskCreateOrg'> =
          await processValidatedRequest({
            name: 'ToDiskCreateOrg',
            request: request,
            method: METHOD_RPC,
            process: input => this.createOrgService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteOrg': {
        let response: ToDiskWireResponseFor<'ToDiskDeleteOrg'> =
          await processValidatedRequest({
            name: 'ToDiskDeleteOrg',
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteOrgService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'isOrgExist': {
        let response: ToDiskWireResponseFor<'ToDiskIsOrgExist'> =
          await processValidatedRequest({
            name: 'ToDiskIsOrgExist',
            request: request,
            method: METHOD_RPC,
            process: input => this.isOrgExistService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'createProject': {
        let response: ToDiskWireResponseFor<'ToDiskCreateProject'> =
          await processValidatedRequest({
            name: 'ToDiskCreateProject',
            request: request,
            method: METHOD_RPC,
            process: input => this.createProjectService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteProject': {
        let response: ToDiskWireResponseFor<'ToDiskDeleteProject'> =
          await processValidatedRequest({
            name: 'ToDiskDeleteProject',
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteProjectService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'isProjectExist': {
        let response: ToDiskWireResponseFor<'ToDiskIsProjectExist'> =
          await processValidatedRequest({
            name: 'ToDiskIsProjectExist',
            request: request,
            method: METHOD_RPC,
            process: input => this.isProjectExistService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'commitRepo': {
        let response: ToDiskWireResponseFor<'ToDiskCommitRepo'> =
          await processValidatedRequest({
            name: 'ToDiskCommitRepo',
            request: request,
            method: METHOD_RPC,
            process: input => this.commitRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'createDevRepo': {
        let response: ToDiskWireResponseFor<'ToDiskCreateDevRepo'> =
          await processValidatedRequest({
            name: 'ToDiskCreateDevRepo',
            request: request,
            method: METHOD_RPC,
            process: input => this.createDevRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteDevRepo': {
        let response: ToDiskWireResponseFor<'ToDiskDeleteDevRepo'> =
          await processValidatedRequest({
            name: 'ToDiskDeleteDevRepo',
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteDevRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'mergeRepo': {
        let response: ToDiskWireResponseFor<'ToDiskMergeRepo'> =
          await processValidatedRequest({
            name: 'ToDiskMergeRepo',
            request: request,
            method: METHOD_RPC,
            process: input => this.mergeRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'pullRepo': {
        let response: ToDiskWireResponseFor<'ToDiskPullRepo'> =
          await processValidatedRequest({
            name: 'ToDiskPullRepo',
            request: request,
            method: METHOD_RPC,
            process: input => this.pullRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'pushRepo': {
        let response: ToDiskWireResponseFor<'ToDiskPushRepo'> =
          await processValidatedRequest({
            name: 'ToDiskPushRepo',
            request: request,
            method: METHOD_RPC,
            process: input => this.pushRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'revertRepoToLastCommit': {
        let response: ToDiskWireResponseFor<'ToDiskRevertRepoToLastCommit'> =
          await processValidatedRequest({
            name: 'ToDiskRevertRepoToLastCommit',
            request: request,
            method: METHOD_RPC,
            process: input => this.revertRepoToLastCommitService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'revertRepoToRemote': {
        let response: ToDiskWireResponseFor<'ToDiskRevertRepoToRemote'> =
          await processValidatedRequest({
            name: 'ToDiskRevertRepoToRemote',
            request: request,
            method: METHOD_RPC,
            process: input => this.revertRepoToRemoteService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'syncRepo': {
        let response: ToDiskWireResponseFor<'ToDiskSyncRepo'> =
          await processValidatedRequest({
            name: 'ToDiskSyncRepo',
            request: request,
            method: METHOD_RPC,
            process: input => this.syncRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'getCatalogFiles': {
        let response: ToDiskWireResponseFor<'ToDiskGetCatalogFiles'> =
          await processValidatedRequest({
            name: 'ToDiskGetCatalogFiles',
            request: request,
            method: METHOD_RPC,
            process: input => this.getCatalogFilesService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'getCatalogNodes': {
        let response: ToDiskWireResponseFor<'ToDiskGetCatalogNodes'> =
          await processValidatedRequest({
            name: 'ToDiskGetCatalogNodes',
            request: request,
            method: METHOD_RPC,
            process: input => this.getCatalogNodesService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'moveCatalogNode': {
        let response: ToDiskWireResponseFor<'ToDiskMoveCatalogNode'> =
          await processValidatedRequest({
            name: 'ToDiskMoveCatalogNode',
            request: request,
            method: METHOD_RPC,
            process: input => this.moveCatalogNodeService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'renameCatalogNode': {
        let response: ToDiskWireResponseFor<'ToDiskRenameCatalogNode'> =
          await processValidatedRequest({
            name: 'ToDiskRenameCatalogNode',
            request: request,
            method: METHOD_RPC,
            process: input => this.renameCatalogNodeService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'createBranch': {
        let response: ToDiskWireResponseFor<'ToDiskCreateBranch'> =
          await processValidatedRequest({
            name: 'ToDiskCreateBranch',
            request: request,
            method: METHOD_RPC,
            process: input => this.createBranchService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteBranch': {
        let response: ToDiskWireResponseFor<'ToDiskDeleteBranch'> =
          await processValidatedRequest({
            name: 'ToDiskDeleteBranch',
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteBranchService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'isBranchExist': {
        let response: ToDiskWireResponseFor<'ToDiskIsBranchExist'> =
          await processValidatedRequest({
            name: 'ToDiskIsBranchExist',
            request: request,
            method: METHOD_RPC,
            process: input => this.isBranchExistService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'createFolder': {
        let response: ToDiskWireResponseFor<'ToDiskCreateFolder'> =
          await processValidatedRequest({
            name: 'ToDiskCreateFolder',
            request: request,
            method: METHOD_RPC,
            process: input => this.createFolderService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteFolder': {
        let response: ToDiskWireResponseFor<'ToDiskDeleteFolder'> =
          await processValidatedRequest({
            name: 'ToDiskDeleteFolder',
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteFolderService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'createFile': {
        let response: ToDiskWireResponseFor<'ToDiskCreateFile'> =
          await processValidatedRequest({
            name: 'ToDiskCreateFile',
            request: request,
            method: METHOD_RPC,
            process: input => this.createFileService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteFile': {
        let response: ToDiskWireResponseFor<'ToDiskDeleteFile'> =
          await processValidatedRequest({
            name: 'ToDiskDeleteFile',
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteFileService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'getFile': {
        let response: ToDiskWireResponseFor<'ToDiskGetFile'> =
          await processValidatedRequest({
            name: 'ToDiskGetFile',
            request: request,
            method: METHOD_RPC,
            process: input => this.getFileService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'saveFile': {
        let response: ToDiskWireResponseFor<'ToDiskSaveFile'> =
          await processValidatedRequest({
            name: 'ToDiskSaveFile',
            request: request,
            method: METHOD_RPC,
            process: input => this.saveFileService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'seedProject': {
        let response: ToDiskWireResponseFor<'ToDiskSeedProject'> =
          await processValidatedRequest({
            name: 'ToDiskSeedProject',
            request: request,
            method: METHOD_RPC,
            process: input => this.seedProjectService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'cloneTestRepo': {
        let response: ToDiskWireResponseFor<'ToDiskCloneTestRepo'> =
          await processValidatedRequest({
            name: 'ToDiskCloneTestRepo',
            request: request,
            method: METHOD_RPC,
            process: input => this.cloneTestRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      default: {
        let exhaustiveRequest: never = request;

        throw new Error(`Unhandled disk request: ${exhaustiveRequest}`);
      }
    }
  }
}
