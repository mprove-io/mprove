import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { SeedProjectService } from '~/services/08-seed/seed-project.service';

@Controller()
export class SeedProjectController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private seedProjectService: SeedProjectService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskSeedProject)
  async seedProject(@Body() body) {
    try {
      let payload = await this.seedProjectService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
