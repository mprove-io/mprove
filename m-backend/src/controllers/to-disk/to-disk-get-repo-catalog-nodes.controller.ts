import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToDiskGetRepoCatalogNodesController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskGetRepoCatalogNodes')
  async toDiskGetRepoCatalogNodes(
    @Body() body: api.ToDiskGetRepoCatalogNodesRequest['payload']
  ): Promise<any> {
    let organizationId = body.organizationId;
    let projectId = body.projectId;
    let repoId = body.repoId;

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: projectId
    });

    let message: api.ToDiskGetRepoCatalogNodesRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskGetRepoCatalogNodes,
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
