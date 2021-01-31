import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { RevertRepoToLastCommitService } from '~disk/services/03-repos/revert-repo-to-last-commit.service';

@Controller()
export class RevertRepoToLastCommitController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private revertRepoToLastCommitService: RevertRepoToLastCommitService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit)
  async revertRepoToLastCommit(@Body() body) {
    try {
      let payload = await this.revertRepoToLastCommitService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
