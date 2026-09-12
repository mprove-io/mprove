import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskCreateOrgResponse } from '#common/zod/to-disk/01-orgs/create-org/create-org-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { CreateOrgService } from './create-org.service';

@Controller()
export class CreateOrgController {
  constructor(
    private createOrgService: CreateOrgService,
    private logger: Logger
  ) {}

  @Post('createOrg')
  async createOrg(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskCreateOrgResponse> {
    let response: ToDiskCreateOrgResponse = await handleHttpRequest({
      operation: 'createOrg',
      body: body,
      method: request.method,
      process: input => this.createOrgService.process(input),
      logger: this.logger
    });

    return response;
  }
}
