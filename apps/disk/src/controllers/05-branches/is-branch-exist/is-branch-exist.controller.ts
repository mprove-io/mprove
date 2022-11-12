import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { interfaces } from '~disk/barrels/interfaces';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
import { IsBranchExistService } from './is-branch-exist.service';

@Controller()
export class IsBranchExistController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private isBranchExistService: IsBranchExistService,
    private pinoLogger: PinoLogger
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist)
  async isBranchExist(@Body() body: any) {
    try {
      let payload = await this.isBranchExistService.process(body);

      return makeOkResponseDisk({
        payload: payload,
        body: body,
        cs: this.cs,
        pinoLogger: this.pinoLogger
      });
    } catch (e) {
      return makeErrorResponseDisk({
        e: e,
        body: body,
        cs: this.cs,
        pinoLogger: this.pinoLogger
      });
    }
  }
}
