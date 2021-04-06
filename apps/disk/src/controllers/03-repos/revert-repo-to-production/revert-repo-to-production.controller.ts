import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { RevertRepoToProductionService } from './revert-repo-to-production.service';

@Controller()
export class RevertRepoToProductionController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private revertRepoToProductionService: RevertRepoToProductionService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToProduction)
  async revertRepoToProduction(@Body() body: any) {
    try {
      let payload = await this.revertRepoToProductionService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
