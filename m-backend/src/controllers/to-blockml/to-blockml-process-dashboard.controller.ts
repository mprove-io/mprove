import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToBlockmlProcessDashboardController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toBlockmlProcessDashboard')
  async toBlockmlProcessDashboard(
    @Body() body: api.ToBlockmlProcessDashboardRequest
  ): Promise<api.ToBlockmlProcessDashboardResponse> {
    let response = await this.rabbitService.sendToBlockml({
      routingKey: api.RabbitBlockmlRoutingEnum.ProcessDashboard.toString(),
      message: body
    });

    return (response as unknown) as api.ToBlockmlProcessDashboardResponse;
  }
}
