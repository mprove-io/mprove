import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToBlockmlProcessQueryController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post(api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessQuery)
  async toBlockmlProcessQuery(
    @Body() body: api.ToBlockmlProcessQueryRequest
  ): Promise<api.ToBlockmlProcessQueryResponse | api.ErrorResponse> {
    try {
      let resp = await this.rabbitService.sendToBlockml<
        api.ToBlockmlProcessQueryResponse
      >({
        routingKey: api.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
        message: body
      });

      return resp;
    } catch (e) {
      return api.makeErrorResponse({ request: body, e: e });
    }
  }
}
