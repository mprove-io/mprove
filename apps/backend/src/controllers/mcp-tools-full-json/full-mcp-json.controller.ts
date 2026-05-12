import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import {
  buildFullMcpJson,
  type FullMcpJson
} from '#backend/functions/build-full-mcp-json';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip.guard';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';

let cachedFullMcpJson: FullMcpJson | undefined;

function getFullMcpJsonCached(): FullMcpJson {
  if (cachedFullMcpJson === undefined) {
    cachedFullMcpJson = buildFullMcpJson();
  }
  return cachedFullMcpJson;
}

@ApiTags('FullMcpJson')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Throttle({
  '1s': {
    limit: 5 * THROTTLE_MULTIPLIER
  },
  '5s': {
    limit: 10 * THROTTLE_MULTIPLIER
  },
  '60s': {
    limit: 50 * THROTTLE_MULTIPLIER
  },
  '600s': {
    limit: 200 * THROTTLE_MULTIPLIER
  }
})
@Controller()
export class FullMcpJsonController {
  constructor() {}

  @Get('api/full-mcp.json')
  @ApiOperation({
    summary: 'FullMcpJson',
    description:
      'Aggregated JSON Schema for all MCP tools (input/output) with shared sub-schemas in $defs'
  })
  @ApiOkResponse()
  async getFullMcpJson(): Promise<FullMcpJson> {
    return getFullMcpJsonCached();
  }
}
