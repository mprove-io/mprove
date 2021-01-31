import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { DeleteFileService } from '~/services/07-files/delete-file.service';

@Controller()
export class DeleteFileController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteFileService: DeleteFileService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskDeleteFile)
  async deleteFile(@Body() body) {
    try {
      let payload = await this.deleteFileService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
