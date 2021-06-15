import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { RenameCatalogNodeService } from './rename-catalog-node.service';

@Controller()
export class RenameCatalogNodeController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private renameCatalogNodeService: RenameCatalogNodeService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode)
  async renameCatalogNode(@Body() body: any) {
    try {
      let payload = await this.renameCatalogNodeService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}