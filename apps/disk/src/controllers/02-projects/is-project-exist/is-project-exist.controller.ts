import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { IsProjectExistService } from './is-project-exist.service';

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
