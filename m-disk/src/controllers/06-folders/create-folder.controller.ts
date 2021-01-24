import { Body, Controller, Post } from '@nestjs/common';
import { api } from '../../barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../../barrels/interfaces';
import { CreateFolderService } from '../../services/06-folders/create-folder.service';

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
