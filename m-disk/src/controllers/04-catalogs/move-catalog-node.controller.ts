import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { MoveCatalogNodeService } from '~/services/04-catalogs/move-catalog-node.service';

@Controller()
export class MoveCatalogNodeController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private moveCatalogNodeService: MoveCatalogNodeService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode)
  async moveCatalogNode(@Body() body) {
    try {
      let payload = await this.moveCatalogNodeService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}