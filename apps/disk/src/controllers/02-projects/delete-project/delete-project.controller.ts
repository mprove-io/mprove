import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskDeleteProjectResponse } from '#common/zod/to-disk/02-projects/delete-project/delete-project-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { DeleteProjectService } from './delete-project.service';

@Controller()
export class DeleteProjectController {
  constructor(
    private deleteProjectService: DeleteProjectService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskDeleteProject)
  async deleteProject(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskDeleteProjectResponse> {
    let response: ToDiskDeleteProjectResponse = await handleHttpRequest({
      name: 'ToDiskDeleteProject',
      body: body,
      method: request.method,
      process: input => this.deleteProjectService.process(input),
      logger: this.logger
    });

    return response;
  }
}
