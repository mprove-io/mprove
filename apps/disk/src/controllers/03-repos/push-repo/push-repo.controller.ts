import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { PushRepoService } from './push-repo.service';

@Controller()
export class PushRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private pushRepoService: PushRepoService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskPushRepo)
  async pushRepo(@Body() body) {
    try {
      let payload = await this.pushRepoService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
