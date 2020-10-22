import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../../services/rabbit.service';
import { api } from '../../../barrels/api';

@Controller()
export class ToDiskIsProjectExistController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskIsProjectExist')
  async toDiskIsProjectExist(
    @Body() body: api.ToDiskIsProjectExistRequest
  ): Promise<api.ToDiskIsProjectExistResponse> {
    let { organizationId, projectId } = body.payload;

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: projectId
    });

    let message = body;

    let response = await this.rabbitService.sendToDisk({
      routingKey: routingKey,
      message: message
    });

    return (response as unknown) as api.ToDiskIsProjectExistResponse;
  }
}
