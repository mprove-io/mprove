import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { SeedProjectService } from './seed-project.service';

@Controller()
export class SeedProjectController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private seedProjectService: SeedProjectService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSeedProject)
  async seedProject(@Body() body: any) {
    try {
      let payload = await this.seedProjectService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
