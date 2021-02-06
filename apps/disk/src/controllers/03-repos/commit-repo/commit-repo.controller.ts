import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { CommitRepoService } from './commit-repo.service';

@Controller()
export class CommitRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private commitRepoService: CommitRepoService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCommitRepo)
  async commitRepo(@Body() body) {
    try {
      let payload = await this.commitRepoService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
