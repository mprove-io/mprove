import { Body, Controller, Post } from '@nestjs/common';
import { api } from '~/barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';
import { CommitRepoService } from '~/services/03-repos/commit-repo.service';

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
