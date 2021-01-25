import { Body, Controller, Post } from '@nestjs/common';
import { api } from '~/barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';
import { QueryService } from '~/services/query.service';

@Controller()
export class ProcessQueryController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private queryService: QueryService
  ) {}

  @Post(api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessQuery)
  async processQuery(@Body() body) {
    try {
      let payload = await this.queryService.processQuery(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
