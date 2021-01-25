import { Body, Controller, Post } from '@nestjs/common';
import { api } from '../barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../barrels/interfaces';
import { GenSqlService } from '../services/gen-sql.service';

@Controller()
export class GenSqlController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private genSqlService: GenSqlService
  ) {}

  @Post(api.ToBlockmlWorkerRequestInfoNameEnum.ToBlockmlWorkerGenSql)
  async genSql(@Body() body) {
    try {
      let payload = await this.genSqlService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
