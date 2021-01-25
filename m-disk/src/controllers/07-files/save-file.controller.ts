import { Body, Controller, Post } from '@nestjs/common';
import { api } from '~/barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';
import { SaveFileService } from '~/services/07-files/save-file.service';

@Controller()
export class SaveFileController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private saveFileService: SaveFileService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskSaveFile)
  async saveFile(@Body() body) {
    try {
      let payload = await this.saveFileService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
