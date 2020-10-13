import { Injectable } from '@nestjs/common';
import { ToDiskCreateOrganization } from '../controllers/to-disk-create-organization';
import { api } from '../barrels/api';
import { ToDiskCreateProject } from '../controllers/to-disk-create-project';
import { ToDiskCreateDevRepo } from '../controllers/to-disk-create-dev-repo';

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

        default:
          throw Error(api.ErEnum.M_DISK_WRONG_REQUEST_INFO_NAME);
      }
    } catch (e) {
      let info: api.ToDiskResponseInfo = {
        status: api.ToDiskResponseInfoStatusEnum.InternalError,
        error: {
          message: e.message,
          at: e.stack.split('\n')[1],
          stackArray: e.stack.split('\n'),
          stack: e.stack
        }
      };

      return {
        info: info,
        payload: {}
      };
    }
  }
}
