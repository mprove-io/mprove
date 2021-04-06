import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { CreateProjectService } from './create-project.service';

@Controller()
export class CreateProjectController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createProjectService: CreateProjectService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateProject)
  async createProject(@Body() body: any) {
    try {
      let payload = await this.createProjectService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
