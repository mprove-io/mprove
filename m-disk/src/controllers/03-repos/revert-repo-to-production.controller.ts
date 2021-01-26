import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { RevertRepoToProductionService } from '~/services/03-repos/revert-repo-to-production.service';

@Controller()
export class RevertRepoToProductionController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private revertRepoToProductionService: RevertRepoToProductionService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToProduction)
  async revertRepoToProduction(@Body() body) {
    try {
      let payload = await this.revertRepoToProductionService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
