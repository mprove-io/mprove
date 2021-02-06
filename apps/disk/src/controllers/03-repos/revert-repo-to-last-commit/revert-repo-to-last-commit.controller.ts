import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { RevertRepoToLastCommitService } from './revert-repo-to-last-commit.service';

@Controller()
export class RevertRepoToLastCommitController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private revertRepoToLastCommitService: RevertRepoToLastCommitService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit)
  async revertRepoToLastCommit(@Body() body) {
    try {
      let payload = await this.revertRepoToLastCommitService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
