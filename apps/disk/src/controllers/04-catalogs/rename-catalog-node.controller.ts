import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { RenameCatalogNodeService } from '~/services/04-catalogs/rename-catalog-node.service';

@Controller()
export class RenameCatalogNodeController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private renameCatalogNodeService: RenameCatalogNodeService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode)
  async renameCatalogNode(@Body() body) {
    try {
      let payload = await this.renameCatalogNodeService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
