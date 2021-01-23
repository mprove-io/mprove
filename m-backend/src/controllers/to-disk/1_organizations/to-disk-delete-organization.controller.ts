import { Body, Controller, Get, Post } from '@nestjs/common';
import { makeRoutingKeyToDisk } from '../../../helper/make-routing-key-to-disk';
import { RabbitService } from '../../../services/rabbit.service';
import { api } from '../../../barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../../../barrels/interfaces';

@Controller()
export class ToDiskDeleteOrganizationController {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization)
  async toDiskDeleteOrganization(@Body() body) {
    try {
      let reqValid = await api.transformValid({
        classType: api.ToDiskDeleteOrganizationRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let { organizationId } = reqValid.payload;

      let routingKey = makeRoutingKeyToDisk({
        organizationId: organizationId,
        projectId: null
      });

      let resp = await this.rabbitService.sendToDisk<
        api.ToDiskDeleteOrganizationResponse
      >({
        routingKey: routingKey,
        message: reqValid
      });

      let payload = resp.payload;

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
