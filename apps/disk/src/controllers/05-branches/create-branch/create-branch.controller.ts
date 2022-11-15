import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { interfaces } from '~disk/barrels/interfaces';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
import { CreateBranchService } from './create-branch.service';

@Controller()
export class CreateBranchController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createBranchService: CreateBranchService,
    private logger: Logger
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateBranch)
  async createBranch(@Req() request: any, @Body() body: any) {
    let startTs = Date.now();
    try {
      let payload = await this.createBranchService.process(body);

      return makeOkResponseDisk({
        body: body,
        payload: payload,
        path: request.url,
        method: request.method,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      return makeErrorResponseDisk({
        body: body,
        e: e,
        path: request.url,
        method: request.method,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    }
  }
}
