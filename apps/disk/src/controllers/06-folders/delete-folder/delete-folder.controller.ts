import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { DeleteFolderService } from './delete-folder.service';

@Controller()
export class DeleteFolderController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteFolderService: DeleteFolderService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskDeleteFolder)
  async deleteFolder(@Body() body) {
    try {
      let payload = await this.deleteFolderService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
