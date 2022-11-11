import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { interfaces } from '~disk/barrels/interfaces';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
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
