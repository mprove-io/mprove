import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { PushRepoService } from '~/services/03-repos/push-repo.service';

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
