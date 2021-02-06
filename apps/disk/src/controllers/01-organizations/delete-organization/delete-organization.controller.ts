import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { DeleteOrganizationService } from './delete-organization.service';

@Controller()
export class DeleteOrganizationController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteOrganizationService: DeleteOrganizationService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization)
  async deleteOrganization(@Body() body) {
    try {
      let payload = await this.deleteOrganizationService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
