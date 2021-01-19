import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToBlockmlProcessDashboardController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post(api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessDashboard)
  async toBlockmlProcessDashboard(
    @Body() body: api.ToBlockmlProcessDashboardRequest
  ): Promise<api.ToBlockmlProcessDashboardResponse | api.ErrorResponse> {
    try {
      let resp = await this.rabbitService.sendToBlockml<
        api.ToBlockmlProcessDashboardResponse
      >({
        routingKey: api.RabbitBlockmlRoutingEnum.ProcessDashboard.toString(),
        message: body
      });

      return resp;
    } catch (e) {
      return api.makeErrorResponse({ request: body, e: e });
    }
  }
}
