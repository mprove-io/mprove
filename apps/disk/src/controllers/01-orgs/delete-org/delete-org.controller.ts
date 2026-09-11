import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskDeleteOrgResponse } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-response';
import { processResponse } from '#disk/functions/process-response';
import { DeleteOrgService } from './delete-org.service';

@Controller()
export class DeleteOrgController {
  constructor(
    private deleteOrgService: DeleteOrgService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskDeleteOrg)
  async deleteOrg(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskDeleteOrgResponse> {
    let response: ToDiskDeleteOrgResponse = await processResponse({
      name: 'ToDiskDeleteOrg',
      body: body,
      method: request.method,
      process: input => this.deleteOrgService.process(input),
      logger: this.logger
    });

    return response;
  }
}
