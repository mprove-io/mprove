import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToDiskGetRepoCatalogNodesController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskGetRepoCatalogNodes')
  async toDiskGetRepoCatalogNodes(
    @Body() body: api.ToDiskGetRepoCatalogNodesRequest
  ): Promise<api.ToDiskGetRepoCatalogNodesResponse> {
    let organizationId = body.payload.organizationId;
    let projectId = body.payload.projectId;
    let repoId = body.payload.repoId;

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: projectId
    });

    let message: api.ToDiskGetRepoCatalogNodesRequest = {
      info: {
        name: body.info.name,
        traceId: body.info.traceId
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

    return (response as unknown) as api.ToDiskGetRepoCatalogNodesResponse;
  }
}
