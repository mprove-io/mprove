import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../../services/rabbit.service';
import { api } from '../../../barrels/api';

@Controller()
export class ToDiskCreateOrganizationController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toDiskCreateOrganization')
  async toDiskCreateOrganization(
    @Body() body: api.ToDiskCreateOrganizationRequest
  ): Promise<api.ToDiskCreateOrganizationResponse | api.ErrorResponse> {
    try {
      let { organizationId } = body.payload;

      let routingKey = makeRoutingKeyToDisk({
        organizationId: organizationId,
        projectId: null
      });

      let message = body;

      let response = await this.rabbitService.sendToDisk<
        api.ToDiskCreateOrganizationResponse
      >({
        routingKey: routingKey,
        message: message
      });

      return response;
    } catch (e) {
      return api.makeErrorResponse({ request: body, e: e });
    }
  }
}
