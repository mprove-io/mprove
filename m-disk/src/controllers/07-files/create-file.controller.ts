import { Body, Controller, Post } from '@nestjs/common';
import { api } from '~/barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';
import { CreateFileService } from '~/services/07-files/create-file.service';

@Controller()
export class CreateFileController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createFileService: CreateFileService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskCreateFile)
  async createFile(@Body() body) {
    try {
      let payload = await this.createFileService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
