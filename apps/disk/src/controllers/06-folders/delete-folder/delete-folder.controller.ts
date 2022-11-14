import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { interfaces } from '~disk/barrels/interfaces';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
import { DeleteFolderService } from './delete-folder.service';

@Controller()
export class DeleteFolderController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteFolderService: DeleteFolderService,
    private logger: Logger
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteFolder)
  async deleteFolder(@Body() body: any) {
    try {
      let payload = await this.deleteFolderService.process(body);

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
