import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class ToBlockmlRebuildStructController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toBlockmlRebuildStruct')
  async toBlockmlRebuildStruct(
    @Body() body: api.ToBlockmlRebuildStructRequest
  ): Promise<api.ToBlockmlRebuildStructResponse> {
    let response = await this.rabbitService.sendToBlockml({
      routingKey: api.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
      message: body
    });

    return (response as unknown) as api.ToBlockmlRebuildStructResponse;
  }
}
