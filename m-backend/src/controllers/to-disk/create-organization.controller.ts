import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from 'src/helper/make-routing-key-to-disk';
import { RabbitService } from 'src/services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class CreateOrganizationController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskCreateOrganization')
  async createOrganization(@Body() body): Promise<any> {
    let organizationId = body.organizationId;

    let message: api.CreateOrganizationRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.CreateOrganization,
        traceId: 'trace123'
      },
      payload: {
        organizationId: organizationId
      }
    };

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: null
    });

    let response = await this.rabbitService.sendToDisk({
      routingKey: routingKey,
      message: message
    });
    return response;
  }
}
