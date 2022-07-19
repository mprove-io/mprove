import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { DeleteDevRepoService } from './delete-dev-repo.service';

@Controller()
export class DeleteDevRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteDevRepoService: DeleteDevRepoService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo)
  async deleteDevRepo(@Body() body: any) {
    try {
      let payload = await this.deleteDevRepoService.process(body);

      return common.makeOkResponse({
        payload,
        body: body,
        logResponseOk: this.cs.get<interfaces.Config['diskLogResponseOk']>(
          'diskLogResponseOk'
        ),
        logOnResponser: this.cs.get<interfaces.Config['diskLogOnResponser']>(
          'diskLogOnResponser'
        ),
        logIsColor: this.cs.get<interfaces.Config['diskLogIsColor']>(
          'diskLogIsColor'
        )
      });
    } catch (e) {
      return common.makeErrorResponse({
        e,
        body: body,
        logResponseError: this.cs.get<
          interfaces.Config['diskLogResponseError']
        >('diskLogResponseError'),
        logOnResponser: this.cs.get<interfaces.Config['diskLogOnResponser']>(
          'diskLogOnResponser'
        ),
        logIsColor: this.cs.get<interfaces.Config['diskLogIsColor']>(
          'diskLogIsColor'
        )
      });
    }
  }
}
