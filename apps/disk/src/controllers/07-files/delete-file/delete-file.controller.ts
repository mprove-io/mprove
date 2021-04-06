import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
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

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
