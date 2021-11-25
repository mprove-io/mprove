import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { DeleteProjectService } from './delete-project.service';

@Controller()
export class DeleteProjectController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteProjectService: DeleteProjectService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteProject)
  async deleteProject(@Body() body: any) {
    try {
      let payload = await this.deleteProjectService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, body: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, body: body });
    }
  }
}
