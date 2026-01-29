import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { DiskConfig } from '#disk/config/disk-config';
import { makeErrorResponseDisk } from '#disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '#disk/functions/make-ok-response-disk';
import { DeleteOrgService } from './delete-org.service';

@Controller()
export class DeleteOrgController {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private deleteOrgService: DeleteOrgService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskDeleteOrg)
  async deleteOrg(@Req() request: any, @Body() body: any) {
    let startTs = Date.now();
    try {
      let payload = await this.deleteOrgService.process(body);

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
      let { resp, wrappedError } = makeErrorResponseDisk({
        body: body,
        e: e,
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
