import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { GetCatalogFilesService } from './get-catalog-files.service';

@Controller()
export class GetCatalogFilesController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private getCatalogFilesService: GetCatalogFilesService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles)
  async getCatalogFiles(@Body() body) {
    try {
      let payload = await this.getCatalogFilesService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
