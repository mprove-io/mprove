import { Body, Controller, Post } from '@nestjs/common';
import { api } from '~/barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';
import { GetCatalogNodesService } from '~/services/04-catalogs/get-catalog-nodes.service';

@Controller()
export class GetCatalogNodesController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private getCatalogNodesService: GetCatalogNodesService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes)
  async getCatalogNodes(@Body() body) {
    try {
      let payload = await this.getCatalogNodesService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
