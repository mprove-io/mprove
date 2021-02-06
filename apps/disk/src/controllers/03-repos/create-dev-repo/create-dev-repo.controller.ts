import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { CreateDevRepoService } from './create-dev-repo.service';

@Controller()
export class CreateDevRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createDevRepoService: CreateDevRepoService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo)
  async createDevRepo(@Body() body) {
    try {
      let payload = await this.createDevRepoService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
