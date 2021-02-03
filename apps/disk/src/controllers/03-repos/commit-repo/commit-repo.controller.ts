import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { CommitRepoService } from './commit-repo.service';

@Controller()
export class CommitRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private commitRepoService: CommitRepoService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo)
  async commitRepo(@Body() body) {
    try {
      let payload = await this.commitRepoService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
