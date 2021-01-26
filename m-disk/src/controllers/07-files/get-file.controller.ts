import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { GetFileService } from '~/services/07-files/get-file.service';

@Controller()
export class GetFileController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private getFileService: GetFileService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskGetFile)
  async getFile(@Body() body) {
    try {
      let payload = await this.getFileService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
