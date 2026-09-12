import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskSeedProjectResponse } from '#common/zod/to-disk/08-seed/seed-project/seed-project-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { SeedProjectService } from './seed-project.service';

@Controller()
export class SeedProjectController {
  constructor(
    private seedProjectService: SeedProjectService,
    private logger: Logger
  ) {}

  @Post('seedProject')
  async seedProject(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskSeedProjectResponse> {
    let response: ToDiskSeedProjectResponse = await handleHttpRequest({
      operation: 'seedProject',
      body: body,
      method: request.method,
      process: input => this.seedProjectService.process(input),
      logger: this.logger
    });

    return response;
  }
}
