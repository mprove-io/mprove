import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { IsOrganizationExistService } from './is-organization-exist.service';

@Controller()
export class IsOrganizationExistController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private isOrganizationExistService: IsOrganizationExistService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist)
  async isOrganizationExist(@Body() body) {
    try {
      let payload = await this.isOrganizationExistService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
