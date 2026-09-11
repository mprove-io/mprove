import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskSeedProjectResponse } from '#common/zod/to-disk/08-seed/seed-project/seed-project-response';
import { processResponse } from '#disk/functions/process-response';
import { SeedProjectService } from './seed-project.service';

@Controller()
export class SeedProjectController {
  constructor(
    private seedProjectService: SeedProjectService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskSeedProject)
  async seedProject(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskSeedProjectResponse> {
    let response: ToDiskSeedProjectResponse = await processResponse({
      name: 'ToDiskSeedProject',
      body: body,
      method: request.method,
      process: input => this.seedProjectService.process(input),
      logger: this.logger
    });

    return response;
  }
}
