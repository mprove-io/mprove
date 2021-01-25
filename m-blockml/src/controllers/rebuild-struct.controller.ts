import { Body, Controller, Post } from '@nestjs/common';
import { api } from '../barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../barrels/interfaces';
import { StructService } from '../services/struct.service';

@Controller()
export class RebuildStructController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private structService: StructService
  ) {}

  @Post(api.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct)
  async rebuildStruct(@Body() body) {
    try {
      let payload = await this.structService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
