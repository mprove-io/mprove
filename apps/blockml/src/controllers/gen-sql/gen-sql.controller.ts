import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { interfaces } from '~blockml/barrels/interfaces';
import { GenSqlService } from './gen-sql.service';

@Controller()
export class GenSqlController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private genSqlService: GenSqlService
  ) {}

  @Post(api.ToBlockmlWorkerRequestInfoNameEnum.ToBlockmlWorkerGenSql)
  async genSql(@Body() body) {
    try {
      let payload = await this.genSqlService.gen(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
