import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { IsProjectExistService } from '~/services/02-projects/is-project-exist.service';

@Controller()
export class IsProjectExistController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private isProjectExistService: IsProjectExistService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist)
  async isProjectExist(@Body() body) {
    try {
      let payload = await this.isProjectExistService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
