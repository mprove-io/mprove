import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { GetFileService } from './get-file.service';

@Controller()
export class GetFileController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private getFileService: GetFileService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetFile)
  async getFile(@Body() body: any) {
    try {
      let payload = await this.getFileService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, body: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, body: body });
    }
  }
}
