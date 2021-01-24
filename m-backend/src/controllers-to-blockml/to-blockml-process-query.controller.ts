import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../services/rabbit.service';
import { api } from '../barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../barrels/interfaces';

@Controller()
export class ToBlockmlProcessQueryController {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessQuery)
  async toBlockmlProcessQuery(@Body() body) {
    try {
      let reqValid = await api.transformValid({
        classType: api.ToBlockmlProcessQueryRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let resp = await this.rabbitService.sendToBlockml<
        api.ToBlockmlProcessQueryResponse
      >({
        routingKey: api.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
        message: reqValid
      });

      let payload = resp.payload;

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
