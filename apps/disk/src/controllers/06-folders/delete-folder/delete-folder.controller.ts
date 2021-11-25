import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { DeleteFolderService } from './delete-folder.service';

@Controller()
export class DeleteFolderController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteFolderService: DeleteFolderService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteFolder)
  async deleteFolder(@Body() body: any) {
    try {
      let payload = await this.deleteFolderService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, body: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, body: body });
    }
  }
}
