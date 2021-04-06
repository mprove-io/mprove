import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { RebuildStructService } from './rebuild-struct.service';

@Controller()
export class RebuildStructController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private structService: RebuildStructService
  ) {}

  @Post(apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct)
  async rebuildStruct(@Body() body: any) {
    try {
      let payload = await this.structService.rebuild(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
