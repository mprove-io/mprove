import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToDiskCreateOrganizationController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskCreateOrganization')
  async toDiskCreateOrganization(@Body() body): Promise<any> {
    let organizationId = body.organizationId;

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: null
    });

    let message: api.ToDiskCreateOrganizationRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization,
        traceId: 'trace123'
      },
      payload: {
        organizationId: organizationId
      }
    };

    let response = await this.rabbitService.sendToDisk({
      routingKey: routingKey,
      message: message
    });

    return response;
  }
}
