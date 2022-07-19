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
