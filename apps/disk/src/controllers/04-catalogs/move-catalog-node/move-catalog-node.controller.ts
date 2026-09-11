import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskMoveCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-response';
import { processResponse } from '#disk/functions/process-response';
import { MoveCatalogNodeService } from './move-catalog-node.service';

@Controller()
export class MoveCatalogNodeController {
  constructor(
    private moveCatalogNodeService: MoveCatalogNodeService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode)
  async moveCatalogNode(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskMoveCatalogNodeResponse> {
    let response: ToDiskMoveCatalogNodeResponse = await processResponse({
      name: 'ToDiskMoveCatalogNode',
      body: body,
      method: request.method,
      process: input => this.moveCatalogNodeService.process(input),
      logger: this.logger
    });

    return response;
  }
}
