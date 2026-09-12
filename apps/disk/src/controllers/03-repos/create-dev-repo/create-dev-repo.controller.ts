import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskCreateDevRepoResponse } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { CreateDevRepoService } from './create-dev-repo.service';

@Controller()
export class CreateDevRepoController {
  constructor(
    private createDevRepoService: CreateDevRepoService,
    private logger: Logger
  ) {}

  @Post('createDevRepo')
  async createDevRepo(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskCreateDevRepoResponse> {
    let response: ToDiskCreateDevRepoResponse = await handleHttpRequest({
      operation: 'createDevRepo',
      body: body,
      method: request.method,
      process: input => this.createDevRepoService.process(input),
      logger: this.logger
    });

    return response;
  }
}
