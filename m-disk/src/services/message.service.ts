import { Injectable } from '@nestjs/common';
import { api } from '../barrels/api';
import { ToDiskCreateOrganization } from '../controllers/1_organizations/to-disk-create-organization';
import { ToDiskIsOrganizationExist } from '../controllers/1_organizations/to-disk-is-organization-exist';
import { ToDiskCreateProject } from '../controllers/2_projects/to-disk-create-project';
import { ToDiskIsProjectExist } from '../controllers/2_projects/to-disk-is-project-exist';
import { ToDiskCreateDevRepo } from '../controllers/3_repos/to-disk-create-dev-repo';
import { ToDiskGetRepoCatalogFiles } from '../controllers/3_repos/to-disk-get-repo-catalog-files';
import { ToDiskGetRepoCatalogNodes } from '../controllers/3_repos/to-disk-get-repo-catalog-nodes';
import { ToDiskMoveNode } from '../controllers/3_repos/to-disk-move-node';
import { ToDiskRenameNode } from '../controllers/3_repos/to-disk-rename-node';
import { ToDiskCreateBranch } from '../controllers/4_branches/to-disk-create-branch';
import { ToDiskIsBranchExist } from '../controllers/4_branches/to-disk-is-branch-exist';
import { ToDiskCreateFolder } from '../controllers/5_folders/to-disk-create-folder';
import { ToDiskCreateFile } from '../controllers/6_files/to-disk-create-file';
import { ToDiskGetFile } from '../controllers/6_files/to-disk-get-file';
import { ToDiskSaveFile } from '../controllers/6_files/to-disk-save-file';
import { ToDiskDeleteOrganization } from '../controllers/1_organizations/to-disk-delete-organization';
import { ToDiskDeleteProject } from '../controllers/2_projects/to-disk-delete-project';
import { ToDiskDeleteDevRepo } from '../controllers/3_repos/to-disk-delete-dev-repo';
import { ToDiskDeleteBranch } from '../controllers/4_branches/to-disk-delete-branch';
import { ToDiskDeleteFolder } from '../controllers/5_folders/to-disk-delete-folder';
import { ToDiskDeleteFile } from '../controllers/6_files/to-disk-delete-file';
import { ToDiskCommitRepo } from 'src/controllers/3_repos/to-disk-commit-repo';

@Injectable()
export class MessageService {
  async processRequest(request: any): Promise<any> {
    try {
      switch (request.info.name) {
        case api.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization:
          return await ToDiskCreateOrganization(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization:
          return await ToDiskDeleteOrganization(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist:
          return await ToDiskIsOrganizationExist(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskCreateProject:
          return await ToDiskCreateProject(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskDeleteProject:
          return await ToDiskDeleteProject(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist:
          return await ToDiskIsProjectExist(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo:
          return await ToDiskCommitRepo(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo:
          return await ToDiskCreateDevRepo(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo:
          return await ToDiskDeleteDevRepo(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskGetRepoCatalogFiles:
          return await ToDiskGetRepoCatalogFiles(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskGetRepoCatalogNodes:
          return await ToDiskGetRepoCatalogNodes(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskMoveNode:
          return await ToDiskMoveNode(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskRenameNode:
          return await ToDiskRenameNode(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskCreateBranch:
          return await ToDiskCreateBranch(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskDeleteBranch:
          return await ToDiskDeleteBranch(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist:
          return await ToDiskIsBranchExist(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskCreateFolder:
          return await ToDiskCreateFolder(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskDeleteFolder:
          return await ToDiskDeleteFolder(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskCreateFile:
          return await ToDiskCreateFile(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskDeleteFile:
          return await ToDiskDeleteFile(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskGetFile:
          return await ToDiskGetFile(request);
        case api.ToDiskRequestInfoNameEnum.ToDiskSaveFile:
          return await ToDiskSaveFile(request);

        default:
          throw Error(api.ErEnum.M_DISK_WRONG_REQUEST_INFO_NAME);
      }
    } catch (e) {
      let info: api.ToDiskResponseInfo = {
        traceId: request.info?.traceId,
        status: api.ToDiskResponseInfoStatusEnum.InternalError,
        error: {
          message: e.message,
          at: e.stack?.split('\n')[1],
          stackArray: e.stack?.split('\n'),
          stack: e.stack,
          e: e
        }
      };

      return {
        info: info,
        payload: {}
      };
    }
  }
}
