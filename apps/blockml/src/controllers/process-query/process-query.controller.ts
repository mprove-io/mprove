import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { interfaces } from '~blockml/barrels/interfaces';
import { ProcessQueryService } from './process-query.service';

@Controller()
export class ProcessQueryController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private processQueryService: ProcessQueryService
  ) {}

  @Post(api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessQuery)
  async processQuery(@Body() body) {
    try {
      let payload = await this.processQueryService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
