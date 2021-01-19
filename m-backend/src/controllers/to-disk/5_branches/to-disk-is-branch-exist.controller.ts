import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../../services/rabbit.service';
import { api } from '../../../barrels/api';

@Controller()
export class ToDiskIsBranchExistController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist)
  async toDiskIsBranchExist(
    @Body() body: api.ToDiskIsBranchExistRequest
  ): Promise<api.ToDiskIsBranchExistResponse | api.ErrorResponse> {
    try {
      let { organizationId, projectId } = body.payload;

      let routingKey = makeRoutingKeyToDisk({
        organizationId: organizationId,
        projectId: projectId
      });

      let resp = await this.rabbitService.sendToDisk<
        api.ToDiskIsBranchExistResponse
      >({
        routingKey: routingKey,
        message: body
      });

      return resp;
    } catch (e) {
      return api.makeErrorResponse({ request: body, e: e });
    }
  }
}
