import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { interfaces } from '~disk/barrels/interfaces';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
import { GetCatalogNodesService } from './get-catalog-nodes.service';

@Controller()
export class GetCatalogNodesController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private getCatalogNodesService: GetCatalogNodesService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes)
  async getCatalogNodes(@Body() body: any) {
    try {
      let payload = await this.getCatalogNodesService.process(body);

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
