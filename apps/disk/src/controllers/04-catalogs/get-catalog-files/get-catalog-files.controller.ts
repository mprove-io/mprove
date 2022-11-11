import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { interfaces } from '~disk/barrels/interfaces';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
import { GetCatalogFilesService } from './get-catalog-files.service';

@Controller()
export class GetCatalogFilesController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private getCatalogFilesService: GetCatalogFilesService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles)
  async getCatalogFiles(@Body() body: any) {
    try {
      let payload = await this.getCatalogFilesService.process(body);

      return makeOkResponseDisk({
        payload: payload,
        body: body,
        cs: this.cs
      });
    } catch (e) {
      return makeErrorResponseDisk({
        e: e,
        body: body,
        cs: this.cs
      });
    }
  }
}
