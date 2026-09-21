import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { handleHttpRequest } from '#blockml/functions/handle-http-request';
import type { ToBlockmlRebuildStructResponse } from '#common/zod/blockml/routes/rebuild-struct/rebuild-struct-response';
import { RebuildStructService } from './rebuild-struct.service';

@Controller()
export class RebuildStructController {
  constructor(
    private structService: RebuildStructService,
    private logger: Logger
  ) {}

  @Post('rebuildStruct')
  async rebuildStruct(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToBlockmlRebuildStructResponse> {
    let response: ToBlockmlRebuildStructResponse = await handleHttpRequest({
      operation: 'rebuildStruct',
      body: body,
      method: request.method,
      process: input => this.structService.process(input),
      logger: this.logger
    });

    return response;
  }
}
