import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetConnectionsRequest,
  zToBackendGetConnectionsResponse
} from '#common/zod/to-backend/connections/to-backend-get-connections';

export class ToBackendGetConnectionsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionsRequest })
) {}

export class ToBackendGetConnectionsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionsResponse })
) {}
