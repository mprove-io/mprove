import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { PushRepoService } from './push-repo.service';

@Controller()
export class PushRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private pushRepoService: PushRepoService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskPushRepo)
  async pushRepo(@Body() body) {
    try {
      let payload = await this.pushRepoService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
