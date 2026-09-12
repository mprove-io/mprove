import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskDeleteOrgResponse } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { DeleteOrgService } from './delete-org.service';

@Controller()
export class DeleteOrgController {
  constructor(
    private deleteOrgService: DeleteOrgService,
    private logger: Logger
  ) {}

  @Post('deleteOrg')
  async deleteOrg(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskDeleteOrgResponse> {
    let response: ToDiskDeleteOrgResponse = await handleHttpRequest({
      operation: 'deleteOrg',
      body: body,
      method: request.method,
      process: input => this.deleteOrgService.process(input),
      logger: this.logger
    });

    return response;
  }
}
