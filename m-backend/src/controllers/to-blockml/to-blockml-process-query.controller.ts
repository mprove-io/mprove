import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToBlockmlProcessQueryController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toBlockmlProcessQuery')
  async toBlockmlProcessQuery(
    @Body() body: api.ToBlockmlProcessQueryRequest
  ): Promise<api.ToBlockmlProcessQueryResponse> {
    let response = await this.rabbitService.sendToBlockml({
      routingKey: api.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
      message: body
    });

    return (response as unknown) as api.ToBlockmlProcessQueryResponse;
  }
}
