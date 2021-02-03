import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { IsOrganizationExistService } from './is-organization-exist.service';

@Controller()
export class IsOrganizationExistController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private isOrganizationExistService: IsOrganizationExistService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist)
  async isOrganizationExist(@Body() body) {
    try {
      let payload = await this.isOrganizationExistService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
