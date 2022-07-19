import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { ProcessQueryService } from './process-query.service';

@Controller()
export class ProcessQueryController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private processQueryService: ProcessQueryService
  ) {}

  @Post(apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessQuery)
  async processQuery(@Body() body: any) {
    try {
      let payload = await this.processQueryService.process(body);

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
