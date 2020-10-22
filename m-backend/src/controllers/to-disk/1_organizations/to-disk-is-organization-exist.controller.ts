import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../../services/rabbit.service';
import { api } from '../../../barrels/api';

@Controller()
export class ToDiskIsOrganizationExistController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskIsOrganizationExist')
  async toDiskIsOrganizationExist(
    @Body() body: api.ToDiskIsOrganizationExistRequest
  ): Promise<api.ToDiskIsOrganizationExistResponse> {
    let { organizationId } = body.payload;

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: null
    });

    let message = body;

    let response = await this.rabbitService.sendToDisk({
      routingKey: routingKey,
      message: message
    });

    return (response as unknown) as api.ToDiskIsOrganizationExistResponse;
  }
}
