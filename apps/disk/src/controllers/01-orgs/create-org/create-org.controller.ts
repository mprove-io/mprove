import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskCreateOrgResponse } from '#common/zod/to-disk/01-orgs/create-org/create-org-response';
import { processResponse } from '#disk/functions/process-response';
import { CreateOrgService } from './create-org.service';

@Controller()
export class CreateOrgController {
  constructor(
    private createOrgService: CreateOrgService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskCreateOrg)
  async createOrg(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskCreateOrgResponse> {
    let response: ToDiskCreateOrgResponse = await processResponse({
      name: 'ToDiskCreateOrg',
      body: body,
      method: request.method,
      process: input => this.createOrgService.process(input),
      logger: this.logger
    });

    return response;
  }
}
