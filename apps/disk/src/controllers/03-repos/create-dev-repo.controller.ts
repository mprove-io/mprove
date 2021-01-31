import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { CreateDevRepoService } from '~/services/03-repos/create-dev-repo.service';

@Controller()
export class CreateDevRepoController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createDevRepoService: CreateDevRepoService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo)
  async createDevRepo(@Body() body) {
    try {
      let payload = await this.createDevRepoService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
