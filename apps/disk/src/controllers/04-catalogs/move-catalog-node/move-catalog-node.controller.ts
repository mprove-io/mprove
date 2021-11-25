import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { MoveCatalogNodeService } from './move-catalog-node.service';

@Controller()
export class MoveCatalogNodeController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private moveCatalogNodeService: MoveCatalogNodeService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode)
  async moveCatalogNode(@Body() body: any) {
    try {
      let payload = await this.moveCatalogNodeService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, body: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, body: body });
    }
  }
}
