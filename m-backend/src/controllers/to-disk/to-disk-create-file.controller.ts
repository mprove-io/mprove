import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToDiskCreateFileController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskCreateFile')
  async toDiskCreateFile(
    @Body() body: api.ToDiskCreateFileRequest
  ): Promise<api.ToDiskCreateFileResponse> {
    let organizationId = body.payload.organizationId;
    let projectId = body.payload.projectId;

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: projectId
    });

    let message = body;

    let response = await this.rabbitService.sendToDisk({
      routingKey: routingKey,
      message: message
    });

    return (response as unknown) as api.ToDiskCreateFileResponse;
  }
}
