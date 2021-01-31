import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { CreateProjectService } from '~disk/services/02-projects/create-project.service';

@Controller()
export class CreateProjectController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createProjectService: CreateProjectService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskCreateProject)
  async createProject(@Body() body) {
    try {
      let payload = await this.createProjectService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
