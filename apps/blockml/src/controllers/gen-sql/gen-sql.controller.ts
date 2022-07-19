import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
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

      return common.makeOkResponse({
        payload,
        body: body,
        logResponseOk: this.cs.get<interfaces.Config['blockmlLogResponseOk']>(
          'blockmlLogResponseOk'
        ),
        logOnResponser: this.cs.get<interfaces.Config['blockmlLogOnResponser']>(
          'blockmlLogOnResponser'
        ),
        logIsColor: this.cs.get<interfaces.Config['blockmlLogIsColor']>(
          'blockmlLogIsColor'
        )
      });
    } catch (e) {
      return common.makeErrorResponse({
        e,
        body: body,
        logResponseError: this.cs.get<
          interfaces.Config['blockmlLogResponseError']
        >('blockmlLogResponseError'),
        logOnResponser: this.cs.get<interfaces.Config['blockmlLogOnResponser']>(
          'blockmlLogOnResponser'
        ),
        logIsColor: this.cs.get<interfaces.Config['blockmlLogIsColor']>(
          'blockmlLogIsColor'
        )
      });
    }
  }
}
