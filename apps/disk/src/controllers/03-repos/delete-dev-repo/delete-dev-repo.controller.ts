import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { DeleteDevRepoService } from './delete-dev-repo.service';

@Controller()
export class DeleteDevRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteDevRepoService: DeleteDevRepoService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo)
  async deleteDevRepo(@Body() body: any) {
    try {
      let payload = await this.deleteDevRepoService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
