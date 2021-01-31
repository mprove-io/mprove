import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { DeleteOrganizationService } from '~disk/services/01-organizations/delete-organization.service';

@Controller()
export class DeleteOrganizationController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteOrganizationService: DeleteOrganizationService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization)
  async deleteOrganization(@Body() body) {
    try {
      let payload = await this.deleteOrganizationService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
