import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToDiskGetRepoCatalogFilesController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskGetRepoCatalogFiles')
  async toDiskGetRepoCatalogFiles(
    @Body() body: api.ToDiskGetRepoCatalogFilesRequest['payload']
  ): Promise<any> {
    let organizationId = body.organizationId;
    let projectId = body.projectId;
    let repoId = body.repoId;

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: projectId
    });

    let message: api.ToDiskGetRepoCatalogFilesRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskGetRepoCatalogFiles,
        traceId: '123'
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: repoId
      }
    };

    let response = await this.rabbitService.sendToDisk({
      routingKey: routingKey,
      message: message
    });

    return response;
  }
}
