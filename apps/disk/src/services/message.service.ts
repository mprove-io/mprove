import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { getToDiskRequestSchema } from '#common/zod/to-disk/get-to-disk-request-schema';
import { parseToDiskOperation } from '#common/zod/to-disk/parse-to-disk-operation';
import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import type { ToDiskOperationResponse } from '#common/zod/to-disk/to-disk-operation-response';
import type { ToDiskRequest } from '#common/zod/to-disk/to-disk-request';
import type { ToDiskResponseForOperation } from '#common/zod/to-disk/to-disk-response-for-operation';
import type { ToDiskResponseForRequest } from '#common/zod/to-disk/to-disk-response-for-request';
import type { ToDiskRpcResponse } from '#common/zod/to-disk/to-disk-rpc-response';
import type { ToDiskUnrouteableResponse } from '#common/zod/to-disk/to-disk-unrouteable-response';
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

    let response: ToDiskResponseForRequest<TRequest> = await this.dispatch({
      request: request
    });

    return response;
  }

  async handleMessage(item: { message: unknown }): Promise<ToDiskRpcResponse> {
    let { message } = item;

    let startTs: number = Date.now();

    let operationValue: unknown =
      typeof message === 'object' && message !== null && 'operation' in message
        ? message.operation
        : undefined;

    let operationResult: z.ZodSafeParseResult<ToDiskOperation> =
      parseToDiskOperation({
        operation: operationValue
      });

    if (operationResult.success === false) {
      let response: ToDiskUnrouteableResponse = {
        result: {
          type: 'InvalidRequest',
          issues: [
            {
              path: 'operation',
              message: 'Missing or unknown disk request discriminator',
              code: 'invalid_value'
            }
          ]
        }
      };

      return response;
    }

    let operation: ToDiskOperation = operationResult.data;

    let requestResult: z.ZodSafeParseResult<ToDiskRequest> =
      getToDiskRequestSchema({
        operation: operation
      }).safeParse(message);

    if (requestResult.success === false) {
      let response: ToDiskOperationResponse = makeInvalidRequestResponse({
        operation: operation,
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

  private async dispatch<TRequest extends ToDiskRequest>(item: {
    request: TRequest;
  }): Promise<ToDiskResponseForRequest<TRequest>>;
  private async dispatch(item: {
    request: ToDiskRequest;
  }): Promise<ToDiskOperationResponse>;
  private async dispatch(item: {
    request: ToDiskRequest;
  }): Promise<ToDiskOperationResponse> {
    let { request } = item;

    switch (request.operation) {
      case 'createOrg': {
        let response: ToDiskResponseForOperation<'createOrg'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.createOrgService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteOrg': {
        let response: ToDiskResponseForOperation<'deleteOrg'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteOrgService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'isOrgExist': {
        let response: ToDiskResponseForOperation<'isOrgExist'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.isOrgExistService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'createProject': {
        let response: ToDiskResponseForOperation<'createProject'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.createProjectService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteProject': {
        let response: ToDiskResponseForOperation<'deleteProject'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteProjectService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'isProjectExist': {
        let response: ToDiskResponseForOperation<'isProjectExist'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.isProjectExistService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'commitRepo': {
        let response: ToDiskResponseForOperation<'commitRepo'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.commitRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'createDevRepo': {
        let response: ToDiskResponseForOperation<'createDevRepo'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.createDevRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteDevRepo': {
        let response: ToDiskResponseForOperation<'deleteDevRepo'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteDevRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'mergeRepo': {
        let response: ToDiskResponseForOperation<'mergeRepo'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.mergeRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'pullRepo': {
        let response: ToDiskResponseForOperation<'pullRepo'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.pullRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'pushRepo': {
        let response: ToDiskResponseForOperation<'pushRepo'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.pushRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'revertRepoToLastCommit': {
        let response: ToDiskResponseForOperation<'revertRepoToLastCommit'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.revertRepoToLastCommitService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'revertRepoToRemote': {
        let response: ToDiskResponseForOperation<'revertRepoToRemote'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.revertRepoToRemoteService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'syncRepo': {
        let response: ToDiskResponseForOperation<'syncRepo'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.syncRepoService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'getCatalogFiles': {
        let response: ToDiskResponseForOperation<'getCatalogFiles'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.getCatalogFilesService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'getCatalogNodes': {
        let response: ToDiskResponseForOperation<'getCatalogNodes'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.getCatalogNodesService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'moveCatalogNode': {
        let response: ToDiskResponseForOperation<'moveCatalogNode'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.moveCatalogNodeService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'renameCatalogNode': {
        let response: ToDiskResponseForOperation<'renameCatalogNode'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.renameCatalogNodeService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'createBranch': {
        let response: ToDiskResponseForOperation<'createBranch'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.createBranchService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteBranch': {
        let response: ToDiskResponseForOperation<'deleteBranch'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteBranchService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'isBranchExist': {
        let response: ToDiskResponseForOperation<'isBranchExist'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.isBranchExistService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'createFolder': {
        let response: ToDiskResponseForOperation<'createFolder'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.createFolderService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteFolder': {
        let response: ToDiskResponseForOperation<'deleteFolder'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteFolderService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'createFile': {
        let response: ToDiskResponseForOperation<'createFile'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.createFileService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'deleteFile': {
        let response: ToDiskResponseForOperation<'deleteFile'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.deleteFileService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'getFile': {
        let response: ToDiskResponseForOperation<'getFile'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.getFileService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'saveFile': {
        let response: ToDiskResponseForOperation<'saveFile'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.saveFileService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'seedProject': {
        let response: ToDiskResponseForOperation<'seedProject'> =
          await processValidatedRequest({
            operation: request.operation,
            request: request,
            method: METHOD_RPC,
            process: input => this.seedProjectService.process(input),
            logger: this.logger
          });

        return response;
      }
      case 'cloneTestRepo': {
        let response: ToDiskResponseForOperation<'cloneTestRepo'> =
          await processValidatedRequest({
            operation: request.operation,
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
