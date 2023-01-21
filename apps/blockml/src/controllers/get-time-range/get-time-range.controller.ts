import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { interfaces } from '~blockml/barrels/interfaces';
import { makeErrorResponseBlockml } from '~blockml/functions/make-error-response-blockml';
import { makeOkResponseBlockml } from '~blockml/functions/make-ok-response-blockml';
import { GetTimeRangeService } from './get-time-range.service';

@Controller()
export class GetTimeRangeController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private getTimeRangeService: GetTimeRangeService,
    private logger: Logger
  ) {}

  @Post(apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlGetTimeRange)
  async getTimeRange(@Req() request: any, @Body() body: any) {
    let startTs = Date.now();
    try {
      let payload = await this.getTimeRangeService.get(body);

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
      return makeErrorResponseBlockml({
        body: body,
        e,
        path: request.url,
        method: request.method,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    }
  }
}
