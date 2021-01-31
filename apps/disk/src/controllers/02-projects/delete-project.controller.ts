import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';
import { DeleteProjectService } from '~/services/02-projects/delete-project.service';

@Controller()
export class DeleteProjectController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteProjectService: DeleteProjectService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskDeleteProject)
  async deleteProject(@Body() body) {
    try {
      let payload = await this.deleteProjectService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
