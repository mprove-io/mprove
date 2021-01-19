import { Injectable } from '@nestjs/common';
import { api } from '../barrels/api';
import { ToDiskCreateOrganization } from '../controllers/1_organizations/to-disk-create-organization';
import { ToDiskIsOrganizationExist } from '../controllers/1_organizations/to-disk-is-organization-exist';
import { ToDiskCreateProject } from '../controllers/2_projects/to-disk-create-project';
import { ToDiskIsProjectExist } from '../controllers/2_projects/to-disk-is-project-exist';
import { ToDiskCreateDevRepo } from '../controllers/3_repos/to-disk-create-dev-repo';
import { ToDiskCreateBranch } from '../controllers/5_branches/to-disk-create-branch';
import { ToDiskIsBranchExist } from '../controllers/5_branches/to-disk-is-branch-exist';
import { ToDiskCreateFolder } from '../controllers/6_folders/to-disk-create-folder';
import { ToDiskCreateFile } from '../controllers/7_files/to-disk-create-file';
import { ToDiskGetFile } from '../controllers/7_files/to-disk-get-file';
import { ToDiskSaveFile } from '../controllers/7_files/to-disk-save-file';
import { ToDiskDeleteOrganization } from '../controllers/1_organizations/to-disk-delete-organization';
import { ToDiskDeleteProject } from '../controllers/2_projects/to-disk-delete-project';
import { ToDiskDeleteDevRepo } from '../controllers/3_repos/to-disk-delete-dev-repo';
import { ToDiskDeleteBranch } from '../controllers/5_branches/to-disk-delete-branch';
import { ToDiskDeleteFolder } from '../controllers/6_folders/to-disk-delete-folder';
import { ToDiskDeleteFile } from '../controllers/7_files/to-disk-delete-file';
import { ToDiskCommitRepo } from '../controllers/3_repos/to-disk-commit-repo';
import { ToDiskPushRepo } from '../controllers/3_repos/to-disk-push-repo';
import { ToDiskGetCatalogFiles } from '../controllers/4_catalogs/to-disk-get-catalog-files';
import { ToDiskGetCatalogNodes } from '../controllers/4_catalogs/to-disk-get-catalog-nodes';
import { ToDiskMoveCatalogNode } from '../controllers/4_catalogs/to-disk-move-catalog-node';
import { ToDiskRenameCatalogNode } from '../controllers/4_catalogs/to-disk-rename-catalog-node';
import { ToDiskPullRepo } from '../controllers/3_repos/to-disk-pull-repo';
import { ToDiskMergeRepo } from '../controllers/3_repos/to-disk-merge-repo';
import { ToDiskRevertRepoToLastCommit } from '../controllers/3_repos/to-disk-revert-repo-to-last-commit';
import { ToDiskRevertRepoToProduction } from '../controllers/3_repos/to-disk-revert-repo-to-production';
import { ToDiskSeedProject } from '../controllers/8_seed/to-disk-seed-project';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../barrels/interfaces';

@Injectable()
export class MessageService {
  constructor(private configService: ConfigService<interfaces.Config>) {}

  async processRequestAndCatch(request: any): Promise<any> {
    try {
      return await this.processRequest(request);
    } catch (e) {
      return api.makeErrorResponse({ request: request, e: e });
    }
  }

  async processRequest(request: any): Promise<any> {
    let orgPath = this.configService.get<
      interfaces.Config['mDataOrganizationsPath']
    >('mDataOrganizationsPath');

    switch (request.info.name) {
      case api.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization:
        return await ToDiskCreateOrganization({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization:
        return await ToDiskDeleteOrganization({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist:
        return await ToDiskIsOrganizationExist({ request, orgPath });

      case api.ToDiskRequestInfoNameEnum.ToDiskCreateProject:
        return await ToDiskCreateProject({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteProject:
        return await ToDiskDeleteProject({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist:
        return await ToDiskIsProjectExist({ request, orgPath });

      case api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo:
        return await ToDiskCommitRepo({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo:
        return await ToDiskCreateDevRepo({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo:
        return await ToDiskDeleteDevRepo({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskMergeRepo:
        return await ToDiskMergeRepo({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskPullRepo:
        return await ToDiskPullRepo({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskPushRepo:
        return await ToDiskPushRepo({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit:
        return await ToDiskRevertRepoToLastCommit({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToProduction:
        return await ToDiskRevertRepoToProduction({ request, orgPath });

      case api.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles:
        return await ToDiskGetCatalogFiles({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes:
        return await ToDiskGetCatalogNodes({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode:
        return await ToDiskMoveCatalogNode({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode:
        return await ToDiskRenameCatalogNode({ request, orgPath });

      case api.ToDiskRequestInfoNameEnum.ToDiskCreateBranch:
        return await ToDiskCreateBranch({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteBranch:
        return await ToDiskDeleteBranch({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist:
        return await ToDiskIsBranchExist({ request, orgPath });

      case api.ToDiskRequestInfoNameEnum.ToDiskCreateFolder:
        return await ToDiskCreateFolder({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteFolder:
        return await ToDiskDeleteFolder({ request, orgPath });

      case api.ToDiskRequestInfoNameEnum.ToDiskCreateFile:
        return await ToDiskCreateFile({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskDeleteFile:
        return await ToDiskDeleteFile({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskGetFile:
        return await ToDiskGetFile({ request, orgPath });
      case api.ToDiskRequestInfoNameEnum.ToDiskSaveFile:
        return await ToDiskSaveFile({ request, orgPath });

      case api.ToDiskRequestInfoNameEnum.ToDiskSeedProject:
        return await ToDiskSeedProject({ request, orgPath });

      default:
        throw new api.ServerError({
          message: api.ErEnum.M_DISK_WRONG_REQUEST_INFO_NAME
        });
    }
  }
}
