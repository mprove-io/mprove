import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../../services/rabbit.service';
import { api } from '../../../barrels/api';

@Controller()
export class ToDiskCreateOrganizationController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization)
  async toDiskCreateOrganization(
    @Body() body: api.ToDiskCreateOrganizationRequest
  ): Promise<api.ToDiskCreateOrganizationResponse | api.ErrorResponse> {
    try {
      let { organizationId } = body.payload;

      let routingKey = makeRoutingKeyToDisk({
        organizationId: organizationId,
        projectId: null
      });

      let resp = await this.rabbitService.sendToDisk<
        api.ToDiskCreateOrganizationResponse
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
