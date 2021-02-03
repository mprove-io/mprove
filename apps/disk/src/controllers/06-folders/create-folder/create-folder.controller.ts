import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { CreateFolderService } from './create-folder.service';

@Controller()
export class CreateFolderController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createFolderService: CreateFolderService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskCreateFolder)
  async createFolder(@Body() body) {
    try {
      let payload = await this.createFolderService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
