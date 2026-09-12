import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskCreateProjectResponse } from '#common/zod/to-disk/02-projects/create-project/create-project-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { CreateProjectService } from './create-project.service';

@Controller()
export class CreateProjectController {
  constructor(
    private createProjectService: CreateProjectService,
    private logger: Logger
  ) {}

  @Post('createProject')
  async createProject(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskCreateProjectResponse> {
    let response: ToDiskCreateProjectResponse = await handleHttpRequest({
      operation: 'createProject',
      body: body,
      method: request.method,
      process: input => this.createProjectService.process(input),
      logger: this.logger
    });

    return response;
  }
}
