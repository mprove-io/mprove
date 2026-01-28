import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToBlockmlRequestInfoNameEnum } from '#common/enums/to/to-blockml-request-info-name.enum';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { makeErrorResponseBlockml } from '~blockml/functions/extra/make-error-response-blockml';
import { makeOkResponseBlockml } from '~blockml/functions/extra/make-ok-response-blockml';
import { RebuildStructService } from './rebuild-struct.service';

@Controller()
export class RebuildStructController {
  constructor(
    private cs: ConfigService<BlockmlConfig>,
    private structService: RebuildStructService,
    private logger: Logger
  ) {}

  @Post(ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct)
  async rebuildStruct(@Req() request: any, @Body() body: any) {
    let startTs = Date.now();

    try {
      let payload = await this.structService.rebuild({
        body: body
      });

      return makeOkResponseBlockml({
        body: body,
        payload: payload,
        path: request.url,
        method: request.method,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      let { resp, wrappedError } = makeErrorResponseBlockml({
        body: body,
        e,
        path: request.url,
        method: request.method,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });

      return resp;
    }
  }
}
