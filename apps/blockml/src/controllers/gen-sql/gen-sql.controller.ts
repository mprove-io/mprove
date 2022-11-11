import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { interfaces } from '~blockml/barrels/interfaces';
import { makeErrorResponseBlockml } from '~blockml/functions/make-error-response-blockml';
import { makeOkResponseBlockml } from '~blockml/functions/make-ok-response-blockml';
import { GenSqlService } from './gen-sql.service';

@Controller()
export class GenSqlController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private genSqlService: GenSqlService
  ) {}

  @Post(apiToBlockml.ToBlockmlWorkerRequestInfoNameEnum.ToBlockmlWorkerGenSql)
  async genSql(@Body() body: any) {
    try {
      let payload = await this.genSqlService.gen(body);

      return makeOkResponseBlockml({
        payload: payload,
        body: body,
        cs: this.cs
      });
    } catch (e) {
      return makeErrorResponseBlockml({
        e,
        body: body,
        cs: this.cs
      });
    }
  }
}
