import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
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
    private pinoLogger: PinoLogger
  ) {}

  @Post(apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct)
  async rebuildStruct(@Body() body: any) {
    try {
      let payload = await this.structService.rebuild(body);

      return makeOkResponseBlockml({
        payload: payload,
        body: body,
        cs: this.cs,
        pinoLogger: this.pinoLogger
      });
    } catch (e) {
      return makeErrorResponseBlockml({
        e,
        body: body,
        cs: this.cs,
        pinoLogger: this.pinoLogger
      });
    }
  }
}
