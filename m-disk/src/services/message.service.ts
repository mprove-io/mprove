import { Injectable } from '@nestjs/common';
import { createOrganization } from 'src/controllers/create-organization';
import { api } from '../barrels/api';

@Injectable()
export class MessageService {
  async processRequest(request: any): Promise<any> {
    if (
      request.info.name === api.ToDiskRequestInfoNameEnum.CreateOrganization
    ) {
      return createOrganization(request);
    }

    return 'm-disk ConsumerService.do Hello!';
  }
}
