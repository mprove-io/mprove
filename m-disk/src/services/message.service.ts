import { Injectable } from '@nestjs/common';
import { ToDiskCreateOrganization } from '../controllers/to-disk-create-organization';
import { api } from '../barrels/api';
import { ToDiskCreateProject } from '../controllers/to-disk-create-project';
import { ToDiskCreateDevRepo } from '../controllers/to-disk-create-dev-repo';
import { ToDiskGetRepoCatalogNodes } from '../controllers/to-disk-get-repo-catalog-nodes';
import { ToDiskGetRepoCatalogFiles } from '../controllers/to-disk-get-repo-catalog-files';
import { ToDiskCreateBranch } from '../controllers/to-disk-create-branch';
import { ToDiskCreateFile } from '../controllers/to-disk-create-file';
import { ToDiskCreateFolder } from '../controllers/to-disk-create-folder';
import { ToDiskSaveFile } from '../controllers/to-disk-save-file';
import { ToDiskGetFile } from '../controllers/to-disk-get-file';

@Injectable()
export class MessageService {
  async processRequest(request: any): Promise<any> {
    try {
      switch (request.info.name) {
        case api.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization:
          return await ToDiskCreateOrganization(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskCreateProject:
          return await ToDiskCreateProject(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo:
          return await ToDiskCreateDevRepo(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskCreateBranch:
          return await ToDiskCreateBranch(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskCreateFolder:
          return await ToDiskCreateFolder(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskCreateFile:
          return await ToDiskCreateFile(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskSaveFile:
          return await ToDiskSaveFile(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskGetFile:
          return await ToDiskGetFile(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskGetRepoCatalogNodes:
          return await ToDiskGetRepoCatalogNodes(request);

        case api.ToDiskRequestInfoNameEnum.ToDiskGetRepoCatalogFiles:
          return await ToDiskGetRepoCatalogFiles(request);

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
