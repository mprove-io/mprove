import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { GetCatalogNodesService } from './get-catalog-nodes.service';

@Controller()
export class GetCatalogNodesController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private getCatalogNodesService: GetCatalogNodesService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes)
  async getCatalogNodes(@Body() body) {
    try {
      let payload = await this.getCatalogNodesService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
