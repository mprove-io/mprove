import { Body, Controller, Post } from '@nestjs/common';
// import { api } from '@src/barrels/api';
import { api } from '~/barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';
import { CreateOrganizationService } from '~/services/01-organizations/create-organization.service';

@Controller()
export class CreateOrganizationController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createOrganizationService: CreateOrganizationService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization)
  async createOrganization(@Body() body) {
    try {
      let payload = await this.createOrganizationService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
