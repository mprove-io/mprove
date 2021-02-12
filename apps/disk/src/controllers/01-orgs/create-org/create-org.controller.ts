import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { CreateOrgService } from './create-org.service';

@Controller()
export class CreateOrgController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createOrgService: CreateOrgService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg)
  async createOrg(@Body() body) {
    try {
      let payload = await this.createOrgService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
