import { Body, Controller, Post } from '@nestjs/common';
import { api } from '~/barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';
import { PullRepoService } from '~/services/03-repos/pull-repo.service';

@Controller()
export class PullRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private pullRepoService: PullRepoService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskPullRepo)
  async pullRepo(@Body() body) {
    try {
      let payload = await this.pullRepoService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
