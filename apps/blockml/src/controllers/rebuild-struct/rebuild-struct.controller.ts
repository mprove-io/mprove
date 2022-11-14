import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { interfaces } from '~blockml/barrels/interfaces';
import { makeErrorResponseBlockml } from '~blockml/functions/make-error-response-blockml';
import { makeOkResponseBlockml } from '~blockml/functions/make-ok-response-blockml';
import { RebuildStructService } from './rebuild-struct.service';

@Controller()
export class RebuildStructController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private structService: RebuildStructService,
    private logger: Logger
  ) {}

  @Post(apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct)
  async rebuildStruct(@Body() body: any) {
    try {
      let payload = await this.structService.rebuild(body);

      return makeOkResponseBlockml({
        payload: payload,
        body: body,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      return makeErrorResponseBlockml({
        e,
        body: body,
        cs: this.cs,
        logger: this.logger
      });
    }
  }
}
