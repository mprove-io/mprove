import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToDiskCreateDevRepoController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskCreateDevRepo')
  async toDiskCreateDevRepo(@Body() body): Promise<any> {
    let organizationId = body.organizationId;
    let projectId = body.projectId;
    let devRepoId = body.devRepoId;

    let routingKey = makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: projectId
    });

    let message: api.ToDiskCreateDevRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
        traceId: 'trace123'
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

    return response;
  }
}
