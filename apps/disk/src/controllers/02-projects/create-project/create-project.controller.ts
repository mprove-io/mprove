import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskCreateProjectResponse } from '#common/zod/to-disk/02-projects/create-project/create-project-response';
import { processResponse } from '#disk/functions/process-response';
import { CreateProjectService } from './create-project.service';

@Controller()
export class CreateProjectController {
  constructor(
    private createProjectService: CreateProjectService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskCreateProject)
  async createProject(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskCreateProjectResponse> {
    let response: ToDiskCreateProjectResponse = await processResponse({
      name: 'ToDiskCreateProject',
      body: body,
      method: request.method,
      process: input => this.createProjectService.process(input),
      logger: this.logger
    });

    return response;
  }
}
