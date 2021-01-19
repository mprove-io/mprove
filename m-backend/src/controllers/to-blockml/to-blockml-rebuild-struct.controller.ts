import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToBlockmlRebuildStructController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post(api.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct)
  async toBlockmlRebuildStruct(
    @Body() body: api.ToBlockmlRebuildStructRequest
  ): Promise<api.ToBlockmlRebuildStructResponse | api.ErrorResponse> {
    try {
      let resp = await this.rabbitService.sendToBlockml<
        api.ToBlockmlRebuildStructResponse
      >({
        routingKey: api.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
        message: body
      });

      return resp;
    } catch (e) {
      return api.makeErrorResponse({ request: body, e: e });
    }
  }
}
