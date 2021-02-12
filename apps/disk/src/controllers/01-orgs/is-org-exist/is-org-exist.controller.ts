import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { IsOrgExistService } from './is-org-exist.service';

@Controller()
export class IsOrgExistController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private isOrgExistService: IsOrgExistService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsOrgExist)
  async isOrgExist(@Body() body) {
    try {
      let payload = await this.isOrgExistService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
