import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToDiskCreateDevRepoController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskCreateDevRepo')
  async toDiskCreateDevRepo(
    @Body() body: api.ToDiskCreateDevRepoRequest
  ): Promise<api.ToDiskCreateDevRepoResponse> {
    let organizationId = body.payload.organizationId;
    let projectId = body.payload.projectId;
    let devRepoId = body.payload.devRepoId;

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: projectId
    });

    let message: api.ToDiskCreateDevRepoRequest = {
      info: {
        name: body.info.name,
        traceId: body.info.traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        devRepoId: devRepoId
      }
    };

    let response = await this.rabbitService.sendToDisk({
      routingKey: routingKey,
      message: message
    });

    return (response as unknown) as api.ToDiskCreateDevRepoResponse;
  }
}
