import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { DeleteOrgService } from './delete-org.service';

@Controller()
export class DeleteOrgController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteOrgService: DeleteOrgService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrg)
  async deleteOrg(@Body() body: any) {
    try {
      let payload = await this.deleteOrgService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
