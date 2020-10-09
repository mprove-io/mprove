import { Injectable } from '@nestjs/common';
import { CreateOrganization } from '../controllers/create-organization';
import { api } from '../barrels/api';

@Injectable()
export class MessageService {
  async processRequest(request: any): Promise<any> {
    try {
      if (
        request.info.name === api.ToDiskRequestInfoNameEnum.CreateOrganization
      ) {
        return await CreateOrganization(request);
      }

      throw Error(api.ErEnum.M_DISK_WRONG_REQUEST_INFO_NAME);
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
