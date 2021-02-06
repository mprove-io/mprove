import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { CreateOrganizationService } from './create-organization.service';

@Controller()
export class CreateOrganizationController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createOrganizationService: CreateOrganizationService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization)
  async createOrganization(@Body() body) {
    try {
      let payload = await this.createOrganizationService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
