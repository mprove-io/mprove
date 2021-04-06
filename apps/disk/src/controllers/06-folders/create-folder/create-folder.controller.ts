import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { CreateFolderService } from './create-folder.service';

@Controller()
export class CreateFolderController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createFolderService: CreateFolderService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFolder)
  async createFolder(@Body() body: any) {
    try {
      let payload = await this.createFolderService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
