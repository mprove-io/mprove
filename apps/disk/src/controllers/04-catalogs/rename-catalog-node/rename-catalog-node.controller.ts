import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskRenameCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { RenameCatalogNodeService } from './rename-catalog-node.service';

@Controller()
export class RenameCatalogNodeController {
  constructor(
    private renameCatalogNodeService: RenameCatalogNodeService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode)
  async renameCatalogNode(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskRenameCatalogNodeResponse> {
    let response: ToDiskRenameCatalogNodeResponse = await handleHttpRequest({
      name: 'ToDiskRenameCatalogNode',
      body: body,
      method: request.method,
      process: input => this.renameCatalogNodeService.process(input),
      logger: this.logger
    });

    return response;
  }
}
