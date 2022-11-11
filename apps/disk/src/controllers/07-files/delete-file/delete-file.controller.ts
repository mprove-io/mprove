import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { interfaces } from '~disk/barrels/interfaces';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
import { DeleteFileService } from './delete-file.service';

@Controller()
export class DeleteFileController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteFileService: DeleteFileService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteFile)
  async deleteFile(@Body() body: any) {
    try {
      let payload = await this.deleteFileService.process(body);

      return makeOkResponseDisk({
        payload: payload,
        body: body,
        cs: this.cs
      });
    } catch (e) {
      return makeErrorResponseDisk({
        e: e,
        body: body,
        cs: this.cs
      });
    }
  }
}
