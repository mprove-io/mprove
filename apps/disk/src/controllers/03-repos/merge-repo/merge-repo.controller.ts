import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { MergeRepoService } from './merge-repo.service';

@Controller()
export class MergeRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private mergeRepoService: MergeRepoService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskMergeRepo)
  async mergeRepo(@Body() body: any) {
    try {
      let payload = await this.mergeRepoService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
