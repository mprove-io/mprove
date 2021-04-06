import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { PullRepoService } from './pull-repo.service';

@Controller()
export class PullRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private pullRepoService: PullRepoService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskPullRepo)
  async pullRepo(@Body() body: any) {
    try {
      let payload = await this.pullRepoService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
