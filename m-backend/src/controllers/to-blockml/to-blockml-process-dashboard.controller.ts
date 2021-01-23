import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../../services/rabbit.service';
import { api } from '../../barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../../barrels/interfaces';

@Controller()
export class ToBlockmlProcessDashboardController {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessDashboard)
  async toBlockmlProcessDashboard(@Body() body) {
    try {
      let reqValid = await api.transformValid({
        classType: api.ToBlockmlProcessDashboardRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let resp = await this.rabbitService.sendToBlockml<
        api.ToBlockmlProcessDashboardResponse
      >({
        routingKey: api.RabbitBlockmlRoutingEnum.ProcessDashboard.toString(),
        message: reqValid
      });

      let payload = resp.payload;

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
