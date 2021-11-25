import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { IsProjectExistService } from './is-project-exist.service';

@Controller()
export class IsProjectExistController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private isProjectExistService: IsProjectExistService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist)
  async isProjectExist(@Body() body: any) {
    try {
      let payload = await this.isProjectExistService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, body: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, body: body });
    }
  }
}
