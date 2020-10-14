import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToDiskCreateOrganizationController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskCreateOrganization')
  async toDiskCreateOrganization(
    @Body() body: api.ToDiskCreateOrganizationRequest
  ): Promise<api.ToDiskCreateOrganizationResponse> {
    let organizationId = body.payload.organizationId;

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: null
    });

    let message = body;

    let response = await this.rabbitService.sendToDisk({
      routingKey: routingKey,
      message: message
    });

    return (response as unknown) as api.ToDiskCreateOrganizationResponse;
  }
}
