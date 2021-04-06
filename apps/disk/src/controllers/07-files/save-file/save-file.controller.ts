import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { SaveFileService } from './save-file.service';

@Controller()
export class SaveFileController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private saveFileService: SaveFileService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile)
  async saveFile(@Body() body: any) {
    try {
      let payload = await this.saveFileService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
