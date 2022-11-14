import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { interfaces } from '~disk/barrels/interfaces';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
import { DeleteDevRepoService } from './delete-dev-repo.service';

@Controller()
export class DeleteDevRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteDevRepoService: DeleteDevRepoService,
    private logger: Logger
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo)
  async deleteDevRepo(@Body() body: any) {
    try {
      let payload = await this.deleteDevRepoService.process(body);

      return makeOkResponseDisk({
        payload: payload,
        body: body,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      return makeErrorResponseDisk({
        e: e,
        body: body,
        cs: this.cs,
        logger: this.logger
      });
    }
  }
}
