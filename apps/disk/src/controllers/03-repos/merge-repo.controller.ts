import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { MergeRepoService } from '~/services/03-repos/merge-repo.service';

@Controller()
export class MergeRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private mergeRepoService: MergeRepoService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskMergeRepo)
  async mergeRepo(@Body() body) {
    try {
      let payload = await this.mergeRepoService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
